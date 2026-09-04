// 檔案系統服務（Storage API 客戶端）
// - 路徑使用陣列表示，會轉為後端期望的字串 path
// - 檔案上傳一律走可續傳的 session 流程：POST 開 session，序列送出 PUT segment，
//   由 uploadScheduler.js 決定每段大小（單檔內完全序列），
//   跨檔案的併發排程由 uploadQueueState.js 的 runner 負責

import apiClient, { handleApiError } from '@/services/apiClient';
import apiConfig from '@/config/api';
import i18n from 'i18next';
import { createSegmentState, recordChunkSuccess, recordChunkFailure } from './uploadScheduler';
import { createUploadQueueStore, createUploadQueue } from './uploadQueueState';

const EP = apiConfig.ENDPOINTS.FILE_SYSTEM;
const SEGMENT_TIMEOUT_MS = 60 * 1000; // 每個 PUT segment 的個別 timeout，覆寫 apiClient 全域 10s 預設

// 路徑工具：將 ['/', 'Pictures'] 轉為 '/Pictures'
export const pathToString = (pathArr) => {
    if (!Array.isArray(pathArr) || pathArr.length === 0) return '/';
    const s = pathArr.join('/').replace(/\/+/g, '/');
    return s.startsWith('/') ? s : `/${s}`;
};

const toSegments = (pathArr) => {
    const p = Array.isArray(pathArr) ? pathArr : ['/'];
    return p.filter((seg, i) => seg && (seg !== '/'));
};

const buildUrl = (base, pathArr, name) => {
    base += '/';
    const segments = toSegments(pathArr).map(encodeURIComponent);
    const tail = name ? [...segments, encodeURIComponent(name)] : segments;
    return tail.length ? `${base}${tail.join('/')}` : base;
};

// 構造未編碼的路徑字串（用於 request body）
// 例：makeBodyPath(["/","圖片","旅行"], "合照.png") -> "/圖片/旅行/合照.png"
export const makeBodyPath = (pathArr, name) => {
    const segs = toSegments(pathArr);
    const all = name ? [...segs, name] : segs;
    return '/' + all.join('/').replace(/\/+/g, '/');
};

// 由字串路徑轉成陣列（UI 需要） 例如："/A/B" -> ["/","A","B"]
export const stringToPath = (pathStr) => {
    if (!pathStr || typeof pathStr !== 'string') return ['/'];
    const segs = pathStr.split('/').filter(Boolean);
    return ['/', ...segs];
};

// 依後端回傳的檔案資訊推斷類型
const guessKind = (mime, name) => {
    const lower = (mime || '').toLowerCase();
    if (lower.startsWith('image/')) return 'image';
    if (lower.startsWith('audio/')) return 'audio';
    if (lower.startsWith('video/')) return 'video';
    if (lower === 'application/pdf' || name?.toLowerCase().endsWith('.pdf')) return 'pdf';
    if (isTextLike(mime, name)) return 'text';
    return 'binary';
};

const isTextLike = (mime, name) => {
    const m = (mime || '').toLowerCase();
    if (m.startsWith('text/')) return true;
    const textExt = ['.txt', '.md', '.json', '.js', '.ts', '.css', '.html', '.csv', '.xml', '.yml', '.yaml'];
    const lower = (name || '').toLowerCase();
    return textExt.some(ext => lower.endsWith(ext));
};

const normalizeItem = (item) => {
    if (item.is_dir === false) {
        return {
            type: 'file',
            name: item.name,
            size: item.size ?? 0,
            mime: item.mime || 'application/octet-stream',
            kind: guessKind(item.mime, item.name),
        };
    }
    // folder（新版 API 一併回傳 mime: "inode/directory"，但列表用不到，仍以固定 folder 圖示呈現）
    return { type: 'folder', name: item.name };
};

// ---- 錯誤處理：統一經由 handleApiError，並為新 API 的關鍵狀態碼提供合理的翻譯訊息 ----
// 字串一律經由 i18n.t(key, fallback) 取得（沿用 apiClient.js 的既有慣例），fallback 是
// 對應的繁中原文，供該 key 尚未被翻譯（理論上不會發生）或 i18n 尚未初始化時使用。

const STATUS_MESSAGE_I18N = {
    423: ['fileSystem.errors.locked', '此檔案正在上傳中，請稍後再試'],
    409: ['fileSystem.errors.conflict', '這段內容與已寫入的資料重疊，請重新整理後再試'],
    403: ['fileSystem.errors.staleSession', '上傳工作階段已過期或不正確，請重新開始上傳'],
};

// 統一收斂錯誤處理：呼叫既有的 handleApiError 取得標準化訊息/狀態碼，
// 針對 423/409/403 覆寫成較適合終端使用者的翻譯說明，其餘沿用 handleApiError 的結果
// （伺服器自帶的錯誤字串，或呼叫端指定的 defaultMessageKey 對應翻譯）。
// 拋出一般 Error（附帶 statusCode，必要時附帶 extra 欄位），維持既有「拋錯」的呼叫慣例，
// 讓 UI 層可以繼續用 try/catch + e.message 處理，不需要因此重寫所有呼叫點。
const raiseStorageError = (error, defaultMessageKey, defaultMessageFallback, extra = {}) => {
    const defaultMessage = i18n.t(defaultMessageKey, defaultMessageFallback);
    const info = handleApiError(error, defaultMessage);
    const override = STATUS_MESSAGE_I18N[info.statusCode];
    const message = override ? i18n.t(override[0], override[1]) : info.error;
    const err = new Error(message);
    err.statusCode = info.statusCode;
    Object.assign(err, extra);
    throw err;
};

const isAbortError = (error) => error?.name === 'CanceledError' || error?.name === 'AbortError';
const isTimeoutError = (error) => error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '');
const statusOf = (error) => error?.response?.status ?? error?.statusCode;

const now = () => (globalThis.performance?.now?.() || Date.now());

// 目錄：list
export const listDirectory = async (pathArr) => {
    const url = buildUrl(EP.FOLDERS.LIST, pathArr);
    let res;
    try {
        res = await apiClient.get(url);
    } catch (error) {
        raiseStorageError(error, 'fileSystem.errors.listDirectory', '無法取得目錄內容');
    }
    const data = res.data || [];
    // 路徑無法讀取時，後端回傳 200 + {}（而非陣列），視為空目錄
    const items = Array.isArray(data) ? data.map(normalizeItem) : [];
    return items.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1));
};

// 資料夾：create / rename(move) / delete
export const createFolder = async (pathArr, name) => {
    const url = buildUrl(EP.FOLDERS.CREATE, pathArr, name);
    try {
        await apiClient.post(url);
    } catch (error) {
        raiseStorageError(error, 'fileSystem.errors.createFolder', '建立資料夾失敗');
    }
};

export const renameFolder = async (pathArr, oldName, newName) => {
    const url = buildUrl(EP.FOLDERS.RENAME, pathArr, oldName);
    const path = makeBodyPath(pathArr, newName);
    try {
        await apiClient.patch(url, { path });
    } catch (error) {
        raiseStorageError(error, 'fileSystem.errors.renameFolder', '重新命名資料夾失敗');
    }
};

export const deleteFolder = async (pathArr, name) => {
    const url = buildUrl(EP.FOLDERS.DELETE, pathArr, name);
    try {
        await apiClient.delete(url);
    } catch (error) {
        raiseStorageError(error, 'fileSystem.errors.deleteFolder', '刪除資料夾失敗');
    }
};

// ---- 檔案上傳：resumable session 流程 ----

// 對單一檔案（含資料夾上傳中的每個項目）執行可續傳上傳。
// 單檔內完全序列：任一時刻最多一個 PUT 在飛，每段大小由 uploadScheduler 決定。
//
// options:
// - onProgress({ chunkBytes, uploadedBytes, totalBytes, sessionId })：每段成功後呼叫
// - onSessionStart(sessionId)：拿到 session_id 後立即呼叫，讓呼叫端能提早記錄以便取消
// - signal：AbortSignal，取消時直接把 abort 錯誤原樣往外拋（不經過 raiseStorageError）
// - resumeSessionId / resumeOffset：手動重試時使用，見下方假設說明
const runResumableUpload = async (pathArr, name, blobLike, options = {}) => {
    const { onProgress, onSessionStart, signal, resumeSessionId, resumeOffset = 0 } = options;
    const totalBytes = blobLike.size;
    const url = buildUrl(EP.FILES.UPLOAD, pathArr, name);

    // 開一個新的可續傳 session（POST /size），回傳 session_id
    const openSession = async () => {
        try {
            const res = await apiClient.post(url, { size: totalBytes }, { signal });
            return res.data.session_id;
        } catch (error) {
            if (isAbortError(error)) throw error;
            raiseStorageError(error, 'fileSystem.errors.createSession', '無法建立上傳工作階段');
        }
    };

    let sessionId = resumeSessionId;
    // resumeOffset 是外部輸入（可能來自舊資料或呼叫端算錯），offset 必須是整數 → 向下取整
    let uploadedBytes = resumeSessionId ? Math.floor(resumeOffset) : 0;

    // 重試時重用未過期的 session_id，直接從已知的連續進度續傳，不重新 POST。
    // 假設說明（未跟後端驗證過）：因為單檔上傳完全序列，呼叫端在失敗當下就知道自己連續
    // 成功寫入到哪個 offset（resumeOffset），所以續傳只需要從該 offset 繼續送，不需要
    // 「查詢已寫入範圍」這種新 API 沒有提供的端點。若 session 其實已在伺服器端過期
    // （超過 1 小時無 PUT 被自動清除），後續 PUT 會收到 403，交由下方 fallback 重新上傳。
    if (!sessionId) sessionId = await openSession();
    onSessionStart?.(sessionId);

    // 空檔案：新 API 沒有專門的建立空檔案端點。防禦性做法（未跟後端驗證過的假設）：
    // 對 offset 0 送一個空 body 的 PUT，觸發伺服器回報 "completed"。
    if (totalBytes === 0) {
        try {
            await apiClient.put(url, new Blob([]), {
                params: { session_id: sessionId, offset: 0 },
                headers: { 'Content-Type': 'application/octet-stream' },
                timeout: SEGMENT_TIMEOUT_MS,
                signal,
            });
        } catch (error) {
            if (isAbortError(error)) throw error;
            raiseStorageError(error, 'fileSystem.errors.createEmptyFile', '建立空檔案失敗', { sessionId, uploadedBytes: 0 });
        }
        onProgress?.({ chunkBytes: 0, uploadedBytes: 0, totalBytes: 0, sessionId });
        return { sessionId };
    }

    let segmentState = createSegmentState();
    // resume-or-restart fallback：帶了 resumeSessionId 進來續傳，卻在 PUT 收到 403（session 過期／
    // 不正確）或 409（offset 重疊，代表續傳假設錯了）時，丟掉舊 session、重開一個新的、offset 歸零、
    // 整檔重來。只做一次；之後任何錯誤都走一般的段內重試迴圈。呼叫端不需要知道續傳到底成不成功。
    let resumeFallbackUsed = false;

    while (uploadedBytes < totalBytes) {
        const remaining = totalBytes - uploadedBytes;
        // segmentState.chunkSize 依契約已是整數，這裡再 floor 一次做為 consumer 端防線
        const chunkSize = Math.floor(Math.min(segmentState.chunkSize, remaining));
        const offset = uploadedBytes;
        const slice = blobLike.slice(offset, offset + chunkSize);

        const t0 = now();
        try {
            await apiClient.put(url, slice, {
                params: { session_id: sessionId, offset },
                headers: { 'Content-Type': 'application/octet-stream' },
                timeout: SEGMENT_TIMEOUT_MS,
                signal,
            });
            const elapsedMs = now() - t0;
            // 以「實際切出並送出的位元組數」記帳，offset 因此恆等於已成功 PUT 的位元組總數，
            // 完全不依賴 segmentState.chunkSize 的正確性（slice.size 必為整數）
            const sentBytes = slice.size;
            uploadedBytes += sentBytes;
            segmentState = recordChunkSuccess(segmentState, { chunkBytes: sentBytes, elapsedMs });
            onProgress?.({ chunkBytes: sentBytes, uploadedBytes, totalBytes, sessionId });
        } catch (error) {
            if (isAbortError(error)) throw error;

            const status = statusOf(error);
            if (resumeSessionId && !resumeFallbackUsed && (status === 403 || status === 409)) {
                resumeFallbackUsed = true;
                sessionId = await openSession();
                onSessionStart?.(sessionId);
                uploadedBytes = 0;
                segmentState = createSegmentState();
                continue; // 從頭重送
            }

            segmentState = recordChunkFailure(segmentState, { isTimeout: isTimeoutError(error) });
            if (segmentState.status === 'failed') {
                raiseStorageError(error, 'fileSystem.errors.uploadRetryExhausted', '檔案上傳失敗，已達重試上限', { sessionId, uploadedBytes });
            }
            // 未達重試上限：迴圈繼續，重試同一個 offset（timeout 時 segmentState.chunkSize 已縮小）
        }
    }

    return { sessionId };
};

// 上傳單一檔案（新檔案或覆寫既有檔案，語意相同：新 session 完成後即取代舊內容）
export const uploadFile = async (pathArr, file, options = {}) => {
    await runResumableUpload(pathArr, file.name, file, options);
};

// 取消一個進行中的上傳 session（釋放伺服器端預先配置的空間，不必等待 1 小時自動清除）
export const cancelFileUpload = async (pathArr, name, sessionId) => {
    const url = buildUrl(EP.FILES.DELETE, pathArr, name);
    try {
        await apiClient.delete(url, { params: { session_id: sessionId } });
    } catch (error) {
        raiseStorageError(error, 'fileSystem.errors.cancelUpload', '取消上傳失敗');
    }
};

// ---- 跨檔案併發：常駐的上傳佇列 ----
// 把 uploadQueueState.js 的 store 與 runner 接上真實的 uploadFile / cancelFileUpload。
// 佇列是常駐的：同一個實例可重複 enqueue()，後加入的檔案跟仍在跑的檔案共用同一份
// 16 檔 / 100MB 併發預算（由 selector 即時從 entries 推導），而非每批重新起算。
// 呼叫端（UI）只建立一次這個實例（例如放在 useRef），之後每次觸發上傳都呼叫同一個實例。
//
// 回傳的 facade：getState / subscribe / enqueue(tasks) / cancel(id) / cancelAll() /
//                retry(id) / retryAll() / remove(id) / clearSucceeded()
// enqueue 的 tasks：[{ id, name, pathArr, file, size }]（id 由呼叫端產生，作為 entry 的識別）
export const createStorageUploadQueue = () =>
    createUploadQueue(createUploadQueueStore(), { uploadFile, cancelFileUpload });

// 建立資料夾上傳所需的所有子資料夾，並回傳攤平後的上傳工作清單（[{ pathArr, file }]）。
// 只負責建資料夾與計算目的地路徑，不會實際開始上傳——實際上傳交給呼叫端自己的 upload queue。
// files 需為使用 <input type="file" webkitdirectory /> 所取得的 FileList 或 File[]
export const prepareFolderUploadTasks = async (pathArr, files) => {
    const list = Array.from(files || []);
    if (!list.length) return [];

    // 收集所有需要建立的資料夾（含最上層）
    const folderSet = new Set(); // key: 'seg1/seg2'
    for (const f of list) {
        const rel = f.webkitRelativePath || f.relativePath || f.path || f.name;
        const parts = rel.split('/').filter(Boolean);
        const dirs = parts.slice(0, -1);
        for (let i = 1; i <= dirs.length; i++) {
            const key = dirs.slice(0, i).join('/');
            if (key) folderSet.add(key);
        }
    }

    // 依深度排序，先建立淺層
    const folders = Array.from(folderSet).sort((a, b) => a.split('/').length - b.split('/').length);

    for (const pathKey of folders) {
        const segs = pathKey.split('/');
        const parent = segs.slice(0, -1);
        const name = segs[segs.length - 1];
        try {
            await createFolder([...pathArr, ...parent], name);
        } catch (e) {
            // 若後端回傳已存在則忽略（raiseStorageError 拋出的 Error 帶 statusCode）
            if (e?.statusCode !== 409) {
                throw e;
            }
        }
    }

    // 依相對路徑分組，算出每個檔案實際的目的地路徑
    return list.map((f) => {
        const rel = f.webkitRelativePath || f.relativePath || f.path || f.name;
        const parts = rel.split('/').filter(Boolean);
        const dirs = parts.slice(0, -1);
        return { pathArr: [...pathArr, ...dirs], file: f };
    });
};

export const renameFile = async (pathArr, oldName, newName) => {
    const url = buildUrl(EP.FILES.RENAME, pathArr, oldName);
    const path = makeBodyPath(pathArr, newName);
    try {
        await apiClient.patch(url, { path });
    } catch (error) {
        raiseStorageError(error, 'fileSystem.errors.renameFile', '重新命名檔案失敗');
    }
};

export const deleteFile = async (pathArr, name) => {
    const url = buildUrl(EP.FILES.DELETE, pathArr, name);
    try {
        await apiClient.delete(url);
    } catch (error) {
        raiseStorageError(error, 'fileSystem.errors.deleteFile', '刪除檔案失敗');
    }
};

export const downloadFile = async (pathArr, name) => {
    // 直接導向後端下載端點，不預先下載 blob
    const endpointUrl = buildUrl(EP.FILES.DOWNLOAD, pathArr, name);
    const a = document.createElement('a');
    a.href = apiConfig.API_BASE_URL + endpointUrl;
    a.download = name; // 提示檔名（實際以後端 Content-Disposition 為準）
    document.body.appendChild(a);
    a.click();
    a.remove();
};

// 取得下載/串流的完整 URL（可用於直接放在 <video> / <audio> src）
export const getDownloadUrl = (pathArr, name) => {
    const endpointUrl = buildUrl(EP.FILES.DOWNLOAD, pathArr, name);
    return apiConfig.API_BASE_URL + endpointUrl;
};

// 預覽/文字內容：若需預覽，下載 blob 並建立 URL
export const getFileEntry = async (pathArr, name, options = {}) => {
    const endpointPath = buildUrl(EP.FILES.DOWNLOAD, pathArr, name);
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;

    let res;
    try {
        res = await apiClient.get(endpointPath, {
            responseType: 'blob',
            timeout: 0,
            onDownloadProgress: (evt) => {
                if (!onProgress) return;
                try {
                    const loaded = evt.loaded ?? 0;
                    const total = evt.total ?? 0;
                    const percent = total > 0 ? (loaded / total) * 100 : undefined;
                    onProgress({ loaded, total, percent });
                } catch (_) { /* ignore */ }
            }
        });
    } catch (error) {
        raiseStorageError(error, 'fileSystem.errors.getFile', '無法取得檔案');
    }
    const blob = res.data;
    const mime = blob.type || 'application/octet-stream';
    const objectUrl = URL.createObjectURL(blob);
    return { type: 'file', name, size: blob.size ?? undefined, mime, kind: guessKind(mime, name), objectUrl };
};

export const getTextContent = async (pathArr, name) => {
    const entry = await getFileEntry(pathArr, name);
    if (entry.kind !== 'text') throw new Error(i18n.t('fileSystem.errors.notTextFile', '非文字檔案'));
    const res = await fetch(entry.objectUrl);
    const text = await res.text();
    URL.revokeObjectURL(entry.objectUrl);
    return text;
};

// 儲存文字內容：無論是「建立新檔案」還是「覆寫既有檔案」都走同一個 resumable session 流程
// （新 API 語意：對已有完成檔案的路徑重新 POST 一個 session，完成後即覆蓋舊內容）
export const saveTextContent = async (pathArr, name, text, options = {}) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const file = new File([blob], name, { type: 'text/plain' });
    await uploadFile(pathArr, file, options);
};

// 移動：同 RENAME 端點，path 指向新的父層與名稱
export const moveFile = async (fromPathArr, name, toPathArr) => {
    const url = buildUrl(EP.FILES.RENAME, fromPathArr, name);
    const path = makeBodyPath(toPathArr, name);
    try {
        await apiClient.patch(url, { path });
    } catch (error) {
        raiseStorageError(error, 'fileSystem.errors.moveFile', '移動檔案失敗');
    }
};

export const moveFolder = async (fromPathArr, name, toPathArr) => {
    const url = buildUrl(EP.FOLDERS.RENAME, fromPathArr, name);
    const path = makeBodyPath(toPathArr, name);
    try {
        await apiClient.patch(url, { path });
    } catch (error) {
        raiseStorageError(error, 'fileSystem.errors.moveFolder', '移動資料夾失敗');
    }
};

// ---- 分享（目前僅支援檔案，資料夾分享邏輯留待之後） ----

// 建立分享連結：expiresInSeconds 為正整數秒數（呼叫端負責換算與範圍檢查，後端上限 1 年）。
// 回傳後端 data 物件：{ code, owner_id, path, type, expires_at, use_count, disabled, created_at, updated_at }
export const createShareCode = async (pathArr, name, expiresInSeconds) => {
    const url = buildUrl(EP.SHARE.CREATE_CODE, pathArr, name);
    try {
        const res = await apiClient.get(url, { params: { expires_in: expiresInSeconds } });
        return res.data?.data || res.data;
    } catch (error) {
        raiseStorageError(error, 'fileSystem.errors.createShare', '建立分享連結失敗');
    }
};

// 由 share code 組出可直接訪問（下載）該檔案的完整後端網址，供未縮短時直接複製使用
export const getShareFileUrl = (code) => {
    return apiConfig.API_BASE_URL + `${EP.SHARE.DOWNLOAD_FILE}/${encodeURIComponent(code)}`;
};

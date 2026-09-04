// 檔案系統服務（Storage API 客戶端）
// - 路徑使用陣列表示，會轉為後端期望的字串 path
// - 檔案上傳一律走可續傳的 session 流程：POST 開 session，序列送出 PUT segment，
//   由 uploadScheduler.js 決定每段大小（單檔內完全序列）與跨檔案的併發准入

import apiClient, { handleApiError } from '@/services/apiClient';
import apiConfig from '@/config/api';
import i18n from 'i18next';
import {
    createSegmentState, recordChunkSuccess, recordChunkFailure,
    createAdmissionState, canAdmitFile, admitFile, releaseFile,
} from './uploadScheduler';

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

    let sessionId = resumeSessionId;
    // resumeOffset 是外部輸入（可能來自舊資料或呼叫端算錯），offset 必須是整數 → 向下取整
    let uploadedBytes = resumeSessionId ? Math.floor(resumeOffset) : 0;

    // 重試時重用未過期的 session_id，直接從已知的連續進度續傳，不重新 POST。
    // 假設說明（未跟後端驗證過）：因為單檔上傳完全序列，呼叫端在失敗當下就知道自己連續
    // 成功寫入到哪個 offset（resumeOffset），所以續傳只需要從該 offset 繼續送，不需要
    // 「查詢已寫入範圍」這種新 API 沒有提供的端點。若 session 其實已在伺服器端過期
    // （超過 1 小時無 PUT 被自動清除），後續 PUT 會收到 403，交由呼叫端捕捉後決定重新上傳。
    if (!sessionId) {
        try {
            const res = await apiClient.post(url, { size: totalBytes }, { signal });
            sessionId = res.data.session_id;
        } catch (error) {
            if (isAbortError(error)) throw error;
            raiseStorageError(error, 'fileSystem.errors.createSession', '無法建立上傳工作階段');
        }
    }
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

// ---- 跨檔案併發：以 uploadScheduler 的 admission controller 排程多檔上傳 ----
// 各檔案獨立成功/失敗（partial batch failure：一個檔案失敗不影響其他檔案），
// 且各自擁有獨立的 AbortController，讓呼叫端可以做到「每檔獨立取消」。
//
// 佇列是常駐的：同一個 createUploadQueue() 回傳的實例可以重複呼叫 enqueue()，
// 後面加入的檔案會跟仍在跑的檔案共用同一份 admission state（累計保留位元組、檔案數），
// 而不是每次呼叫都重新起算一份新的 16 檔/100MB 預算。呼叫端（例如 UI）應該只建立一次
// 這個實例（例如放在 useRef），之後每次使用者觸發新的上傳都呼叫同一個實例的 enqueue()。
//
// enqueue(tasks, hooks) 的 hooks（tasks: [{ pathArr, file }]）：
// - onFileStart(task, index, controller)：檔案實際開始上傳前呼叫，controller 供呼叫端保存以便日後取消
// - onFileSessionStart(task, index, sessionId)：拿到 session_id 後呼叫
// - onFileProgress(task, index, { chunkBytes, uploadedBytes, totalBytes })：每段成功後呼叫
// - onFileSettled(result, index)：該檔案結束（成功/失敗/取消）後呼叫，result: { file, pathArr, success, error? }
// index 是這次 enqueue() 呼叫內的位置（從 0 開始），不是跨批次的全域序號。
// 回傳 Promise，於「這次 enqueue 加入的檔案」全部結束（成功/失敗/取消）時 resolve 成 results 陣列；
// 不代表整個佇列（含其他批次）都已經跑完。
export const createUploadQueue = () => {
    let admission = createAdmissionState();
    const pending = []; // [{ task, hooks, resolve }]，尚未被 admission 放行開始跑的工作

    const runOne = async (task, hooks) => {
        const controller = new AbortController();
        hooks.onStart(controller);
        try {
            await uploadFile(task.pathArr, task.file, {
                signal: controller.signal,
                onSessionStart: hooks.onSessionStart,
                onProgress: hooks.onProgress,
            });
            return { file: task.file, pathArr: task.pathArr, success: true };
        } catch (error) {
            return { file: task.file, pathArr: task.pathArr, success: false, error };
        }
    };

    // 同步地把目前 admission 允許的工作都放行；每個工作結束釋放預算後會再呼叫自己一次，
    // 讓佇列裡排隊中的下一個工作有機會被放行——不管它是這次呼叫加入的，還是更早的批次留下的。
    const pump = () => {
        while (pending.length > 0 && canAdmitFile(admission)) {
            const { task, hooks, resolve } = pending.shift();
            admission = admitFile(admission, task.file.size || 0);
            runOne(task, hooks).then((result) => {
                admission = releaseFile(admission, task.file.size || 0);
                resolve(result);
                pump();
            });
        }
    };

    const enqueue = (tasks, hooks = {}) => {
        const promises = tasks.map((task, index) => new Promise((resolve) => {
            pending.push({
                task,
                hooks: {
                    onStart: (controller) => hooks.onFileStart?.(task, index, controller),
                    onSessionStart: (sessionId) => hooks.onFileSessionStart?.(task, index, sessionId),
                    onProgress: (progress) => hooks.onFileProgress?.(task, index, progress),
                },
                resolve: (result) => { hooks.onFileSettled?.(result, index); resolve(result); },
            });
        }));
        pump();
        return Promise.all(promises);
    };

    return { enqueue };
};

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

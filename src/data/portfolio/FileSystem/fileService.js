// 檔案系統服務（後端 API 樣板）
// - 方便替換後端，函式簽名穩定，僅需填入實際 API 即可
// - 路徑使用陣列表示，會轉為後端期望的字串 path

import apiClient from '@/services/apiClient';
import apiConfig from '@/config/api';
//

const EP = apiConfig.ENDPOINTS.FILE_SYSTEM;

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
    // folder
    return { type: 'folder', name: item.name };
};

// 目錄：list
export const listDirectory = async (pathArr) => {
    const url = buildUrl(EP.FOLDERS.LIST, pathArr);
    const res = await apiClient.get(url);
    const data = res.data || [];
    // 支援兩種後端格式：items 或 folders+files
    let items = [];
    if (Array.isArray(data)) {
        items = data.map(normalizeItem);
    }
    return items.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1));
};

// 資料夾：create / rename / delete
export const createFolder = async (pathArr, name) => {
    const url = buildUrl(EP.FOLDERS.CREATE, pathArr, name);
    await apiClient.post(url);
};

export const renameFolder = async (pathArr, oldName, newName) => {
    const url = buildUrl(EP.FOLDERS.RENAME, pathArr, oldName);
    const path = makeBodyPath(pathArr, newName);
    await apiClient.patch(url, { path });
};

export const deleteFolder = async (pathArr, name) => {
    const url = buildUrl(EP.FOLDERS.DELETE, pathArr, name);
    await apiClient.delete(url);
};

// 檔案：upload / rename / delete / download
export const uploadFile = async (pathArr, file, options = {}) => {
    const url = buildUrl(EP.FILES.UPLOAD, pathArr, file.name);
    const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB
    const TARGET_WINDOW_MS = 3000; // 以 3 秒為預估窗口
    const MAX_PARALLEL = 50; // 並行上限，避免壓力過大

    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;

    const total_chunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
    const file_id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    const fileTotalBytes = file.size;
    let fileBytesUploaded = 0;

    // 單一 chunk 上傳
    const uploadChunk = async (chunk_index) => {
        const start = chunk_index * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const slice = file.slice(start, end, file.type || 'application/octet-stream');
        const chunkSize = end - start;
        const form = new FormData();
        form.append('file_id', file_id);
        form.append('chunk_index', String(chunk_index));
        form.append('total_chunks', String(total_chunks));
        form.append('chunk_data', slice, file.name);
        const t0 = (globalThis.performance?.now?.() || Date.now());
        await apiClient.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' }, signal: options.signal });
        const t1 = (globalThis.performance?.now?.() || Date.now());
        // 進度回報（於每個 chunk 完成後遞增）
        fileBytesUploaded += chunkSize;
        if (onProgress) {
            try {
                onProgress({
                    type: 'file',
                    fileName: file.name,
                    chunkBytes: chunkSize,
                    fileBytesUploaded,
                    fileTotalBytes,
                });
            } catch (_) { /* ignore progress handler errors */ }
        }
        return t1 - t0;
    };

    // 僅一塊時，直接上傳
    if (total_chunks === 1) {
        await uploadChunk(0);
        return;
    }

    // 將最後一個 chunk 保留到最末上傳
    const lastIndex = total_chunks - 1;
    const indices = Array.from({ length: lastIndex }, (_, i) => i); // 0..lastIndex-1

    // 以回合（round）方式執行：每回合估算 3 秒能完成的 chunk 數量並行啟動
    let parallel = 1;
    let nextPtr = 0;
    let avgDtMs = 0; // 平均單塊時間（毫秒）

    while (nextPtr < indices.length) {
        const remaining = indices.length - nextPtr;
        // 初次沒有資料，先保守用 1；有平均值則估計 3 秒可完成多少塊
        const predicted = avgDtMs > 0 ? TARGET_WINDOW_MS / Math.max(1, avgDtMs) : 1;
        parallel = Math.round(Math.max(1, Math.min(MAX_PARALLEL, Math.min(remaining, (predicted * parallel) || 1))));

        const batch = [];
        for (let i = 0; i < parallel; i++) {
            const chunkIndex = indices[nextPtr++];
            batch.push(uploadChunk(chunkIndex));
        }

        const dts = await Promise.all(batch); // 完整一回合
        // 更新平均時間（加權平均）
        const sum = dts.reduce((a, b) => a + b, 0);
        avgDtMs = sum / dts.length;
    }

    // 上傳最後一個 chunk
    await uploadChunk(lastIndex);
};

// 新增空白檔案：以 0-byte 檔案上傳達成，與資料夾新增方式概念相同
export const createEmptyFile = async (pathArr, name) => {
    const emptyBlob = new Blob([new Uint8Array(0)], { type: '' });
    const emptyFile = new File([emptyBlob], name, { type: '' });
    await uploadFile(pathArr, emptyFile);
};

// 上傳資料夾：讀取目錄內的所有層級，逐一建立資料夾並上傳檔案
// files 需為使用 <input type="file" webkitdirectory /> 所取得的 FileList 或 File[]
export const uploadFolder = async (pathArr, files, options = {}) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    // 收集所有需要建立的資料夾（含最上層）
    const folderSet = new Set(); // key: 'seg1/seg2'
    for (const f of list) {
        const rel = f.webkitRelativePath || f.relativePath || f.path || f.name;
        const parts = rel.split('/').filter(Boolean);
        // 去掉檔名，留下資料夾路徑
        const dirs = parts.slice(0, -1);
        for (let i = 1; i <= dirs.length; i++) {
            const key = dirs.slice(0, i).join('/');
            if (key) folderSet.add(key);
        }
    }

    // 依深度排序，先建立淺層
    const folders = Array.from(folderSet).sort((a, b) => a.split('/').length - b.split('/').length);

    // 逐一建立資料夾
    for (const pathKey of folders) {
        const segs = pathKey.split('/');
        const parent = segs.slice(0, -1);
        const name = segs[segs.length - 1];
        try {
            await createFolder([...pathArr, ...parent], name);
        } catch (e) {
            // 若後端回傳已存在則忽略
            if (e?.response?.status !== 409) {
                // 其他錯誤拋出
                throw e;
            }
        }
    }

    // 上傳所有檔案
    for (const f of list) {
        const rel = f.webkitRelativePath || f.relativePath || f.path || f.name;
        const parts = rel.split('/').filter(Boolean);
        const dirs = parts.slice(0, -1);
        const targetPath = [...pathArr, ...dirs];
        await uploadFile(targetPath, f, options);
    }
};

export const renameFile = async (pathArr, oldName, newName) => {
    const url = buildUrl(EP.FILES.RENAME, pathArr, oldName);
    const path = makeBodyPath(pathArr, newName);
    await apiClient.patch(url, { path });
};

export const deleteFile = async (pathArr, name) => {
    const url = buildUrl(EP.FILES.DELETE, pathArr, name);
    await apiClient.delete(url);
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

// 預覽/文字內容：若需預覽，下載 blob 並建立 URL
export const getFileEntry = async (pathArr, name, options = {}) => {
    const endpointPath = buildUrl(EP.FILES.DOWNLOAD, pathArr, name);
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;

    const res = await apiClient.get(endpointPath, {
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
    const blob = res.data;
    const mime = blob.type || 'application/octet-stream';
    const objectUrl = URL.createObjectURL(blob);
    return { type: 'file', name, size: blob.size ?? undefined, mime, kind: guessKind(mime, name), objectUrl };
};

export const getTextContent = async (pathArr, name) => {
    const entry = await getFileEntry(pathArr, name);
    if (entry.kind !== 'text') throw new Error('非文字檔案');
    const res = await fetch(entry.objectUrl);
    const text = await res.text();
    URL.revokeObjectURL(entry.objectUrl);
    return text;
};

export const saveTextContent = async (pathArr, name, text) => {
    // 覆寫內容：以上傳同名檔案方式
    const blob = new Blob([text], { type: 'text/plain' });
    const file = new File([blob], name, { type: 'text/plain' });
    await uploadFile(pathArr, file);
};

// 移動：同 RENAME 端點，path 指向新的父層與名稱
export const moveFile = async (fromPathArr, name, toPathArr) => {
    const url = buildUrl(EP.FILES.RENAME, fromPathArr, name);
    const path = makeBodyPath(toPathArr, name);
    await apiClient.patch(url, { path });
};

export const moveFolder = async (fromPathArr, name, toPathArr) => {
    const url = buildUrl(EP.FOLDERS.RENAME, fromPathArr, name);
    const path = makeBodyPath(toPathArr, name);
    await apiClient.patch(url, { path });
};

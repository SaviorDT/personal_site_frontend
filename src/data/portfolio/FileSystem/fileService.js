// 檔案系統服務（後端 API 樣板）
// - 方便替換後端，函式簽名穩定，僅需填入實際 API 即可
// - 路徑使用陣列表示，會轉為後端期望的字串 path

import apiClient from '@/services/apiClient';
import apiConfig from '@/config/api';

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
    const path = buildUrl('', pathArr, newName);
    await apiClient.patch(url, { path: path });
};

export const deleteFolder = async (pathArr, name) => {
    const url = buildUrl(EP.FOLDERS.DELETE, pathArr, name);
    await apiClient.delete(url);
};

// 檔案：upload / rename / delete / download
export const uploadFile = async (pathArr, file) => {
    const url = buildUrl(EP.FILES.UPLOAD, pathArr, file.name);
    const chunkSize = 10 * 1024 * 1024; // 10 MB
    const total_chuncks = Math.max(1, Math.ceil(file.size / chunkSize));
    const file_id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    for (let chunck_index = 0; chunck_index < total_chuncks; chunck_index++) {
        const start = chunck_index * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const slice = file.slice(start, end, file.type || 'application/octet-stream');
        const form = new FormData();
        form.append('file_id', file_id);
        form.append('chunk_index', String(chunck_index));
        form.append('total_chunks', String(total_chuncks));
        form.append('chunk_data', slice, file.name);
        await apiClient.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
};

// 新增空白檔案：以 0-byte 檔案上傳達成，與資料夾新增方式概念相同
export const createEmptyFile = async (pathArr, name) => {
    const emptyBlob = new Blob([new Uint8Array(0)], { type: '' });
    const emptyFile = new File([emptyBlob], name, { type: '' });
    await uploadFile(pathArr, emptyFile);
};

// 上傳資料夾：讀取目錄內的所有層級，逐一建立資料夾並上傳檔案
// files 需為使用 <input type="file" webkitdirectory /> 所取得的 FileList 或 File[]
export const uploadFolder = async (pathArr, files) => {
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
        await uploadFile(targetPath, f);
    }
};

export const renameFile = async (pathArr, oldName, newName) => {
    const url = buildUrl(EP.FILES.RENAME, pathArr, oldName);
    const path = buildUrl('', pathArr, newName);
    await apiClient.patch(url, { path: path });
};

export const deleteFile = async (pathArr, name) => {
    const url = buildUrl(EP.FILES.DELETE, pathArr, name);
    await apiClient.delete(url);
};

export const downloadFile = async (pathArr, name) => {
    const endpointUrl = buildUrl(EP.FILES.DOWNLOAD, pathArr, name);
    const res = await apiClient.get(endpointUrl, { responseType: 'blob' });
    const blobUrl = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = blobUrl; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
};

// 預覽/文字內容：若需預覽，下載 blob 並建立 URL
export const getFileEntry = async (pathArr, name) => {
    const endpointUrl = buildUrl(EP.FILES.DOWNLOAD, pathArr, name);
    const res = await apiClient.get(endpointUrl, { responseType: 'blob' });
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

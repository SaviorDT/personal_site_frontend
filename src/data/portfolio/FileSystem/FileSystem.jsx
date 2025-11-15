import React, { useEffect, useMemo, useRef, useState } from 'react';
import './FileSystem.css';
import { listDirectory, createFolder, createEmptyFile, uploadFile, uploadFolder, deleteFile, deleteFolder, renameFile, renameFolder, downloadFile, getFileEntry, getTextContent, saveTextContent, pathToString, stringToPath, moveFile, moveFolder, getDownloadUrl } from './fileService';
import FolderItem from './FolderItem';
import FileItem from './FileItem';
import { metadata } from './FileSystemMetadata';

const FileSystem = () => {
    // 路徑使用陣列表示，例如 ["/" , "Pictures"]
    const [path, setPath] = useState(['/']);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [creatingFile, setCreatingFile] = useState(false);
    const [previewEntry, setPreviewEntry] = useState(null); // { type, name, ... }
    const [textDraft, setTextDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const uploadRef = useRef(null);
    const folderUploadRef = useRef(null);

    // 上傳進度（全域彙總）：bytesTransferred / totalBytes
    const [uploading, setUploading] = useState(false);
    const [uploadBytesDone, setUploadBytesDone] = useState(0);
    const [uploadBytesTotal, setUploadBytesTotal] = useState(0);
    const [uploadLabel, setUploadLabel] = useState('');
    const abortRef = useRef(null);

    // 下載進度（預覽用）
    const [downloading, setDownloading] = useState(false);
    const [downloadBytesDone, setDownloadBytesDone] = useState(0);
    const [downloadBytesTotal, setDownloadBytesTotal] = useState(0);
    const [downloadLabel, setDownloadLabel] = useState('');

    const refresh = async () => {
        setLoading(true);
        setError('');
        try {
            const dir = await listDirectory(path);
            setItems(dir);
        } catch (e) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path.join('/')]);

    const onOpenFolder = (name) => setPath((p) => [...p, name]);
    const onGoUp = () => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
    const onGoRoot = () => setPath(['/']);

    const onCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setCreating(true);
        setError('');
        try {
            await createFolder(path, newFolderName.trim());
            setNewFolderName('');
            await refresh();
        } catch (e) {
            setError(e.message || String(e));
        } finally {
            setCreating(false);
        }
    };

    const onCreateFile = async () => {
        const name = newFileName.trim();
        if (!name) return;
        if (/[\\/]/.test(name)) { setError('檔名不可包含 / 或 \\'); return; }
        setCreatingFile(true);
        setError('');
        try {
            await createEmptyFile(path, name);
            setNewFileName('');
            await refresh();
        } catch (e) {
            setError(e.message || String(e));
        } finally {
            setCreatingFile(false);
        }
    };

    const onUploadFiles = async (ev) => {
        const files = Array.from(ev.target.files || []);
        if (!files.length) return;
        setLoading(true);
        setError('');
        try {
            // 設定總大小與狀態
            const total = files.reduce((sum, f) => sum + (f.size || 0), 0);
            setUploadBytesDone(0);
            setUploadBytesTotal(total);
            setUploading(true);
            setUploadLabel(`上傳 ${files.length} 個檔案…`);
            const progressCb = ({ chunkBytes }) => {
                setUploadBytesDone((v) => v + (chunkBytes || 0));
            };
            // 建立 AbortController 以便取消
            abortRef.current = new AbortController();
            for (const f of files) {
                await uploadFile(path, f, { onProgress: progressCb, signal: abortRef.current.signal });
            }
            setUploading(false);
            await refresh();
        } catch (e) {
            // 若為主動取消，忽略錯誤
            if (e?.name === 'CanceledError' || e?.name === 'AbortError') {
                // no-op
            } else {
                setError(e.message || String(e));
            }
        } finally {
            setLoading(false);
            abortRef.current = null;
            ev.target.value = '';
        }
    };

    const onUploadFolder = async (ev) => {
        const files = Array.from(ev.target.files || []);
        if (!files.length) return;
        setLoading(true);
        setError('');
        try {
            // 彙總總大小
            const total = files.reduce((sum, f) => sum + (f.size || 0), 0);
            setUploadBytesDone(0);
            setUploadBytesTotal(total);
            setUploading(true);
            setUploadLabel('上傳資料夾…');
            const progressCb = ({ chunkBytes }) => {
                setUploadBytesDone((v) => v + (chunkBytes || 0));
            };
            abortRef.current = new AbortController();
            await uploadFolder(path, files, { onProgress: progressCb, signal: abortRef.current.signal });
            setUploading(false);
            await refresh();
        } catch (e) {
            if (e?.name === 'CanceledError' || e?.name === 'AbortError') {
                // no-op
            } else {
                setError(e.message || String(e));
            }
        } finally {
            setLoading(false);
            abortRef.current = null;
            ev.target.value = '';
        }
    };

    const onDelete = async (entry) => {
        if (!confirm(`確定要刪除「${entry.name}」嗎？`)) return;
        try {
            if (entry.type === 'folder') {
                await deleteFolder(path, entry.name);
            } else {
                await deleteFile(path, entry.name);
            }
            await refresh();
            if (previewEntry && previewEntry.name === entry.name) setPreviewEntry(null);
        } catch (e) {
            setError(e.message || String(e));
        }
    };

    const onRename = async (entry) => {
        const newName = prompt('重新命名為：', entry.name);
        if (!newName || newName === entry.name) return;
        try {
            if (entry.type === 'folder') {
                await renameFolder(path, entry.name, newName);
            } else {
                await renameFile(path, entry.name, newName);
            }
            await refresh();
        } catch (e) {
            setError(e.message || String(e));
        }
    };

    const onDownload = async (entry) => {
        try {
            await downloadFile(path, entry.name);
        } catch (e) {
            setError(e.message || String(e));
        }
    };

    const isSubPath = (a, b) => {
        // a 是否為 b 的子路徑（含等於） a/b 皆為陣列
        if (b.length > a.length) return false;
        for (let i = 0; i < b.length; i++) if (a[i] !== b[i]) return false;
        return true;
    };

    const onMove = async (entry) => {
        const currentFolderStr = pathToString(path);
        const input = prompt(`移動到目標資料夾路徑（例如 / 或 /相簿/日本）`, currentFolderStr);
        if (input == null) return;
        const dest = stringToPath(input);
        try {
            // 防呆：資料夾不可移到自己或子層
            if (entry.type === 'folder') {
                const srcFolder = [...path, entry.name];
                if (isSubPath(dest, srcFolder)) {
                    alert('不可將資料夾移動到自己或其子路徑');
                    return;
                }
                await moveFolder(path, entry.name, dest);
            } else {
                await moveFile(path, entry.name, dest);
            }
            await refresh();
        } catch (e) {
            setError(e.message || String(e));
        }
    };

    const onOpenFile = async (name) => {
        try {
            // 若為影片，直接使用後端的串流/下載 URL 並嵌入瀏覽器播放器（避免先 fetch blob）
            const local = items.find(i => i.name === name && i.type === 'file');
            if (local && local.kind === 'video') {
                const url = getDownloadUrl(path, name);
                setPreviewEntry({ type: 'file', name, mime: local.mime, kind: 'video', objectUrl: url });
                setTextDraft('');
                return;
            }

            // 其他類型：下載 blob 並建立 object URL（原本行為）
            setDownloading(true);
            setDownloadBytesDone(0);
            setDownloadBytesTotal(0);
            setDownloadLabel('下載預覽…');
            const entry = await getFileEntry(path, name, {
                onProgress: ({ loaded, total }) => {
                    setDownloadBytesDone(loaded || 0);
                    setDownloadBytesTotal(total || 0);
                }
            });
            setPreviewEntry(entry);
            if (entry.kind === 'text') {
                const txt = await getTextContent(path, name);
                setTextDraft(txt);
            } else {
                setTextDraft('');
            }
            setDownloading(false);
        } catch (e) {
            setError(e.message || String(e));
            setDownloading(false);
        }
    };

    const onSaveText = async () => {
        if (!previewEntry || previewEntry.kind !== 'text') return;
        setSaving(true);
        setError('');
        try {
            await saveTextContent(path, previewEntry.name, textDraft);
            // 更新快照
            const updated = await getFileEntry(path, previewEntry.name);
            setPreviewEntry(updated);
            await refresh();
        } catch (e) {
            setError(e.message || String(e));
        } finally {
            setSaving(false);
        }
    };

    const breadcrumb = useMemo(() => {
        const parts = [];
        for (let i = 0; i < path.length; i++) {
            const target = path.slice(0, i + 1); // 捕捉每個階層的目標路徑
            const key = target.join('/');
            const label = i === 0 ? '根目錄' : path[i];
            parts.push(
                <button key={key} className="fs-breadcrumb" onClick={() => setPath(target)}>
                    {label}
                </button>
            );
            if (i < path.length - 1) parts.push(
                <span key={`sep-${i}`} className="fs-breadcrumb-sep">/</span>
            );
        }
        return parts;
    }, [path]);

    return (
        <>
            <div className="project-header">
                <h1 className="project-title">{metadata.title}</h1>
                <p className="project-subtitle">{metadata.description}</p>

                <div className="project-meta">
                    <span className="project-category">{metadata.category}</span>
                    <span className="project-year">{metadata.year}</span>
                    <span className="project-duration">{metadata.duration}</span>
                </div>
            </div>
            <div className="fs-root">
                <div className="fs-header">
                    <div className="fs-path">
                        {breadcrumb}
                    </div>
                    <div className="fs-actions">
                        <button className="fs-btn" onClick={onGoRoot} title="回到根目錄">根</button>
                        <button className="fs-btn" onClick={onGoUp} title="上一層">⌃</button>
                        <input ref={uploadRef} type="file" multiple onChange={onUploadFiles} style={{ display: 'none' }} />
                        <button
                            className="fs-upload fs-btn primary"
                            title="上傳檔案"
                            onClick={() => uploadRef.current && uploadRef.current.click()}
                        >
                            上傳
                        </button>
                        <input
                            ref={folderUploadRef}
                            type="file"
                            onChange={onUploadFolder}
                            style={{ display: 'none' }}
                            webkitdirectory=""
                            directory=""
                            mozdirectory=""
                        />
                        <button
                            className="fs-btn"
                            title="上傳資料夾"
                            onClick={() => folderUploadRef.current && folderUploadRef.current.click()}
                        >
                            上傳資料夾
                        </button>
                    </div>
                </div>

                <div className="fs-toolbar">
                    <input
                        className="fs-input"
                        placeholder="新資料夾名稱"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onCreateFolder()}
                        disabled={creating}
                    />
                    <button className="fs-btn primary" onClick={onCreateFolder} disabled={creating}>
                        新增資料夾
                    </button>
                    <input
                        className="fs-input"
                        placeholder="新檔案名稱（例如 notes.txt）"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onCreateFile()}
                        disabled={creatingFile}
                    />
                    <button className="fs-btn" onClick={onCreateFile} disabled={creatingFile}>
                        新增檔案
                    </button>
                    <div className="fs-spacer" />
                    <button className="fs-btn" onClick={refresh} disabled={loading}>重新整理</button>
                </div>

                {error && <div className="fs-error">{error}</div>}

                {uploading && (
                    <div className="fs-progress">
                        <div className="fs-progress-head">
                            <span className="fs-progress-label">{uploadLabel}</span>
                            <span className="fs-progress-bytes">
                                {formatBytes(uploadBytesDone)} / {formatBytes(uploadBytesTotal)}
                            </span>
                        </div>
                        <div className="fs-progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={uploadBytesTotal || 1} aria-valuenow={uploadBytesDone}>
                            <div className="fs-progress-fill" style={{ width: `${Math.min(100, (uploadBytesTotal ? (uploadBytesDone / uploadBytesTotal) * 100 : 0)).toFixed(2)}%` }} />
                        </div>
                        <div>
                            <button
                                className="fs-btn"
                                onClick={() => {
                                    if (abortRef.current) {
                                        abortRef.current.abort();
                                    }
                                    setUploading(false);
                                    setUploadBytesDone(0);
                                    setUploadBytesTotal(0);
                                    setUploadLabel('');
                                }}
                            >
                                取消上傳
                            </button>
                        </div>
                    </div>
                )}

                {downloading && (
                    <div className="fs-progress">
                        <div className="fs-progress-head">
                            <span className="fs-progress-label">{downloadLabel}</span>
                            <span className="fs-progress-bytes">
                                {formatBytes(downloadBytesDone)} / {formatBytes(downloadBytesTotal)}
                            </span>
                        </div>
                        <div className="fs-progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={downloadBytesTotal || 1} aria-valuenow={downloadBytesDone}>
                            <div className="fs-progress-fill" style={{ width: `${Math.min(100, (downloadBytesTotal ? (downloadBytesDone / downloadBytesTotal) * 100 : 0)).toFixed(2)}%` }} />
                        </div>
                    </div>
                )}

                <div className="fs-container" aria-busy={loading}>
                    {loading ? (
                        <div className="fs-empty">讀取中…</div>
                    ) : items.length === 0 ? (
                        <div className="fs-empty">這裡還沒有檔案或資料夾</div>
                    ) : (
                        items.map((entry) => (
                            entry.type === 'folder' ? (
                                <FolderItem
                                    key={`f-${entry.name}`}
                                    name={entry.name}
                                    onOpen={() => onOpenFolder(entry.name)}
                                    onDelete={() => onDelete(entry)}
                                    onRename={() => onRename({ type: 'folder', name: entry.name })}
                                    onMove={() => onMove({ type: 'folder', name: entry.name })}
                                />
                            ) : (
                                <FileItem
                                    key={`fi-${entry.name}`}
                                    name={entry.name}
                                    size={entry.size}
                                    kind={entry.kind}
                                    mime={entry.mime}
                                    onOpen={() => onOpenFile(entry.name)}
                                    onDelete={() => onDelete(entry)}
                                    onRename={() => onRename({ type: 'file', name: entry.name })}
                                    onDownload={() => onDownload(entry)}
                                    onMove={() => onMove({ type: 'file', name: entry.name })}
                                />
                            )
                        ))
                    )}
                </div>

                {previewEntry && (
                    <div className="fs-preview">
                        <div className="fs-preview-header">
                            <div className="fs-preview-title">預覽：{previewEntry.name}</div>
                            <div className="fs-preview-actions">
                                <button className="fs-btn" onClick={() => setPreviewEntry(null)}>關閉</button>
                                <button className="fs-btn" onClick={() => onDownload(previewEntry)}>下載</button>
                            </div>
                        </div>

                        <div className="fs-preview-body">
                            {previewEntry.kind === 'image' && previewEntry.objectUrl && (
                                <img src={previewEntry.objectUrl} alt={previewEntry.name} className="fs-image" />
                            )}
                            {previewEntry.kind === 'audio' && previewEntry.objectUrl && (
                                <audio controls src={previewEntry.objectUrl} className="fs-media" />
                            )}
                            {previewEntry.kind === 'video' && previewEntry.objectUrl && (
                                <video controls src={previewEntry.objectUrl} className="fs-media" />
                            )}
                            {previewEntry.kind === 'pdf' && previewEntry.objectUrl && (
                                <object data={previewEntry.objectUrl} type="application/pdf" className="fs-pdf">PDF 無法預覽，請下載</object>
                            )}
                            {previewEntry.kind === 'text' && (
                                <div className="fs-text-editor">
                                    <textarea
                                        value={textDraft}
                                        onChange={(e) => setTextDraft(e.target.value)}
                                        spellCheck={false}
                                    />
                                    <div className="fs-editor-actions">
                                        <button className="fs-btn primary" onClick={onSaveText} disabled={saving}>
                                            {saving ? '儲存中…' : '儲存'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {!['image', 'audio', 'video', 'pdf', 'text'].includes(previewEntry.kind) && (
                                <div className="fs-generic">無法預覽此檔案，請下載查看。</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FileSystem;

// 顯示人性化容量
function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const idx = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const val = bytes / Math.pow(1024, idx);
    return `${val.toFixed(val >= 100 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

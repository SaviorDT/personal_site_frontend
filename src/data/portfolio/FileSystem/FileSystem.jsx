import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FileSystem.css';
import {
    listDirectory, createFolder, createUploadQueue, prepareFolderUploadTasks, uploadFile, cancelFileUpload,
    deleteFile, deleteFolder, renameFile, renameFolder, downloadFile, getFileEntry,
    getTextContent, saveTextContent, pathToString, stringToPath, moveFile, moveFolder, getDownloadUrl,
} from './fileService';
import FolderItem from './FolderItem';
import FileItem from './FileItem';
import UploadQueueItem from './UploadQueueItem';
import { metadata } from './FileSystemMetadata';
import { useAuth } from '@/contexts/AuthContext';

const isAbortLike = (error) => error?.name === 'CanceledError' || error?.name === 'AbortError';
const makeUploadId = () => (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const FileSystem = () => {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();

    // 路徑使用陣列表示，例如 ["/" , "Pictures"]
    const [path, setPath] = useState(['/']);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [previewEntry, setPreviewEntry] = useState(null); // { type, name, ..., isNew? }
    const [textDraft, setTextDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const uploadRef = useRef(null);
    const folderUploadRef = useRef(null);

    // 上傳佇列：每個檔案一筆，狀態獨立（uploading/success/failed/cancelled）
    const [uploadEntries, setUploadEntries] = useState([]);
    // 整個上傳佇列面板是否收合：只收合列表本身，彙總列（完成數/位元組）仍然常駐顯示
    const [uploadListCollapsed, setUploadListCollapsed] = useState(false);
    // 常駐的 upload queue：整個元件生命週期只建立一次，之後每次觸發上傳都塞進同一份，
    // 讓還在跑的批次跟新加入的批次共用同一份 16 檔/100MB 的併發預算，而不是各自重新起算。
    const uploadQueueRef = useRef(null);
    if (!uploadQueueRef.current) uploadQueueRef.current = createUploadQueue();

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

    // 新增檔案：不打任何 API，直接以「尚未儲存」狀態開啟既有的文字編輯面板；
    // 第一次按下「儲存」才真正發起建立（見 onSaveText）。取消/關閉編輯器則什麼都不會建立。
    const onCreateFile = () => {
        const name = newFileName.trim();
        if (!name) return;
        if (/[\\/]/.test(name)) { setError(t('fileSystem.validation.invalidFileName', '檔名不可包含 / 或 \\')); return; }
        setError('');
        setPreviewEntry({ type: 'file', name, kind: 'text', isNew: true });
        setTextDraft('');
        setNewFileName('');
    };

    // ---- 上傳佇列 ----

    const updateUploadEntry = (id, patch) => {
        setUploadEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    };

    const startUploadBatch = async (destPathArr, fileList, { isFolder }) => {
        const files = Array.from(fileList || []);
        if (!files.length) return;

        const newEntries = files.map((file) => ({
            id: makeUploadId(),
            pathArr: destPathArr, // 資料夾上傳時，onFileStart 會依實際子路徑覆寫成正確的目的地
            file,
            name: file.webkitRelativePath || file.name,
            size: file.size || 0,
            status: 'uploading',
            uploadedBytes: 0,
            sessionId: null,
            error: null,
            controller: null,
        }));
        setUploadEntries((prev) => [...prev, ...newEntries]);

        try {
            const tasks = isFolder
                ? await prepareFolderUploadTasks(destPathArr, files)
                : files.map((file) => ({ pathArr: destPathArr, file }));

            await uploadQueueRef.current.enqueue(tasks, {
                onFileStart: (task, index, controller) => {
                    updateUploadEntry(newEntries[index].id, { controller, pathArr: task.pathArr });
                },
                onFileSessionStart: (task, index, sessionId) => {
                    updateUploadEntry(newEntries[index].id, { sessionId });
                },
                onFileProgress: (task, index, progress) => {
                    updateUploadEntry(newEntries[index].id, { uploadedBytes: progress.uploadedBytes });
                },
                onFileSettled: (result, index) => {
                    const id = newEntries[index].id;
                    if (result.success) {
                        updateUploadEntry(id, { status: 'success', uploadedBytes: newEntries[index].size });
                    } else if (isAbortLike(result.error)) {
                        updateUploadEntry(id, { status: 'cancelled' });
                    } else {
                        updateUploadEntry(id, { status: 'failed', error: result.error?.message || String(result.error) });
                    }
                },
            });
        } catch (batchError) {
            // 例如資料夾建立本身就失敗，整批還沒進入排程就中止；把還沒開始跑的行標記失敗
            setUploadEntries((prev) => prev.map((e) => (
                newEntries.some((ne) => ne.id === e.id) && e.status === 'uploading'
                    ? { ...e, status: 'failed', error: batchError.message || String(batchError) }
                    : e
            )));
        }
        await refresh();
    };

    const onPickFiles = (ev) => {
        const files = Array.from(ev.target.files || []);
        ev.target.value = '';
        startUploadBatch(path, files, { isFolder: false });
    };

    const onPickFolder = (ev) => {
        const files = Array.from(ev.target.files || []);
        ev.target.value = '';
        startUploadBatch(path, files, { isFolder: true });
    };

    // 取消單一檔案：中止 client 端請求，並在已知 session_id 時呼叫伺服器端取消釋放預留空間
    const onCancelUploadEntry = async (entry) => {
        entry.controller?.abort();
        if (entry.sessionId) {
            try {
                await cancelFileUpload(entry.pathArr, entry.file.name, entry.sessionId);
            } catch (_) {
                // 盡力而為：取消端點本身失敗不影響前端已中止的狀態
            }
        }
    };

    const onCancelAllUploads = () => {
        uploadEntries.filter((e) => e.status === 'uploading').forEach(onCancelUploadEntry);
    };

    // 重試：重用已知的 session_id（若有）與已上傳的位元組續傳，重試時估算器會自動從 1MB 重新開始
    const onRetryUploadEntry = (entry) => {
        const controller = new AbortController();
        updateUploadEntry(entry.id, { status: 'uploading', error: null, controller });
        uploadFile(entry.pathArr, entry.file, {
            signal: controller.signal,
            resumeSessionId: entry.sessionId || undefined,
            resumeOffset: entry.uploadedBytes || 0,
            onSessionStart: (sessionId) => updateUploadEntry(entry.id, { sessionId }),
            onProgress: (progress) => updateUploadEntry(entry.id, { uploadedBytes: progress.uploadedBytes }),
        }).then(() => {
            updateUploadEntry(entry.id, { status: 'success', uploadedBytes: entry.size });
            refresh();
        }).catch((err) => {
            if (isAbortLike(err)) {
                updateUploadEntry(entry.id, { status: 'cancelled' });
            } else {
                updateUploadEntry(entry.id, {
                    status: 'failed',
                    error: err.message || String(err),
                    sessionId: err.sessionId ?? entry.sessionId,
                    uploadedBytes: err.uploadedBytes ?? entry.uploadedBytes,
                });
            }
        });
    };

    const onDismissUploadEntry = (id) => {
        setUploadEntries((prev) => prev.filter((e) => e.id !== id));
    };

    const onClearCompletedUploads = () => {
        setUploadEntries((prev) => prev.filter((e) => e.status !== 'success'));
    };

    const uploadSummary = useMemo(() => {
        if (uploadEntries.length === 0) return null;
        const totalFiles = uploadEntries.length;
        const doneFiles = uploadEntries.filter((e) => e.status !== 'uploading').length;
        const totalBytes = uploadEntries.reduce((sum, e) => sum + (e.size || 0), 0);
        const doneBytes = uploadEntries.reduce((sum, e) => sum + (e.status === 'success' ? e.size : (e.uploadedBytes || 0)), 0);
        const hasActive = uploadEntries.some((e) => e.status === 'uploading');
        const hasSuccess = uploadEntries.some((e) => e.status === 'success');
        return { totalFiles, doneFiles, totalBytes, doneBytes, hasActive, hasSuccess };
    }, [uploadEntries]);

    const onDelete = async (entry) => {
        if (!confirm(t('fileSystem.confirm.deleteEntry', '確定要刪除「{{name}}」嗎？', { name: entry.name }))) return;
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
        const newName = prompt(t('fileSystem.confirm.renamePrompt', '重新命名為：'), entry.name);
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
        const input = prompt(t('fileSystem.confirm.movePrompt', '移動到目標資料夾路徑（例如 / 或 /相簿/日本）'), currentFolderStr);
        if (input == null) return;
        const dest = stringToPath(input);
        try {
            // 防呆：資料夾不可移到自己或子層
            if (entry.type === 'folder') {
                const srcFolder = [...path, entry.name];
                if (isSubPath(dest, srcFolder)) {
                    alert(t('fileSystem.confirm.cannotMoveIntoSelf', '不可將資料夾移動到自己或其子路徑'));
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
            setDownloadLabel(t('fileSystem.download.previewLoading', '下載預覽…'));
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

    // 儲存文字內容：previewEntry.isNew 為 true 時，這是該檔案的第一次儲存（真正發起建立）；
    // 否則是覆寫既有檔案。兩種情境走同一個 saveTextContent，成功後都會拿到「已儲存」的最新快照。
    const onSaveText = async () => {
        if (!previewEntry || previewEntry.kind !== 'text') return;
        setSaving(true);
        setError('');
        try {
            await saveTextContent(path, previewEntry.name, textDraft);
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
            const label = i === 0 ? t('fileSystem.breadcrumb.root', '根目錄') : path[i];
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, t]); // 把 t 加進依賴：切換語言時「根目錄」這個標籤也要跟著重新翻譯

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
                {!isAuthenticated && (
                    <div className="fs-guest-notice">
                        {t('fileSystem.guestNotice', '目前以訪客身分使用共用儲存空間，所有未登入的使用者共用同一份檔案，且管理員可以看到這裡的所有內容——請不要上傳不想被看到的東西。')}
                    </div>
                )}

                <div className="fs-header">
                    <div className="fs-path">
                        {breadcrumb}
                    </div>
                    <div className="fs-actions">
                        <button className="fs-btn" onClick={onGoRoot} title={t('fileSystem.actions.goRoot', '回到根目錄')}>根</button>
                        <button className="fs-btn" onClick={onGoUp} title={t('fileSystem.actions.goUp', '上一層')}>⌃</button>
                        <input ref={uploadRef} type="file" multiple onChange={onPickFiles} style={{ display: 'none' }} />
                        <button
                            className="fs-upload fs-btn primary"
                            title={t('fileSystem.actions.uploadFilesTitle', '上傳檔案')}
                            onClick={() => uploadRef.current && uploadRef.current.click()}
                        >
                            {t('fileSystem.actions.upload', '上傳')}
                        </button>
                        <input
                            ref={folderUploadRef}
                            type="file"
                            onChange={onPickFolder}
                            style={{ display: 'none' }}
                            webkitdirectory=""
                            directory=""
                            mozdirectory=""
                        />
                        <button
                            className="fs-btn"
                            title={t('fileSystem.actions.uploadFolder', '上傳資料夾')}
                            onClick={() => folderUploadRef.current && folderUploadRef.current.click()}
                        >
                            {t('fileSystem.actions.uploadFolder', '上傳資料夾')}
                        </button>
                    </div>
                </div>

                <div className="fs-toolbar">
                    <input
                        className="fs-input"
                        placeholder={t('fileSystem.toolbar.newFolderPlaceholder', '新資料夾名稱')}
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onCreateFolder()}
                        disabled={creating}
                    />
                    <button className="fs-btn primary" onClick={onCreateFolder} disabled={creating}>
                        {t('fileSystem.toolbar.createFolder', '新增資料夾')}
                    </button>
                    <input
                        className="fs-input"
                        placeholder={t('fileSystem.toolbar.newFilePlaceholder', '新檔案名稱（例如 notes.txt）')}
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onCreateFile()}
                    />
                    <button className="fs-btn" onClick={onCreateFile}>
                        {t('fileSystem.toolbar.createFile', '新增檔案')}
                    </button>
                    <div className="fs-spacer" />
                    <button className="fs-btn" onClick={refresh} disabled={loading}>{t('fileSystem.actions.refresh', '重新整理')}</button>
                </div>

                {error && <div className="fs-error">{error}</div>}

                {uploadSummary && (
                    <div className="fs-upload-queue">
                        <div className="fs-upload-summary">
                            <button
                                className="fs-upload-collapse-toggle"
                                onClick={() => setUploadListCollapsed((v) => !v)}
                                aria-expanded={!uploadListCollapsed}
                                title={uploadListCollapsed ? t('fileSystem.upload.expand', '展開') : t('fileSystem.upload.collapse', '收合')}
                            >
                                <span aria-hidden="true">{uploadListCollapsed ? '▸' : '▾'}</span>
                                <span>
                                    {t('fileSystem.upload.summary', '上傳進度：{{done}} / {{total}} 個檔案（{{doneBytes}} / {{totalBytes}}）', {
                                        done: uploadSummary.doneFiles,
                                        total: uploadSummary.totalFiles,
                                        doneBytes: formatBytes(uploadSummary.doneBytes),
                                        totalBytes: formatBytes(uploadSummary.totalBytes),
                                    })}
                                </span>
                            </button>
                            <div className="fs-upload-summary-actions">
                                {uploadSummary.hasActive && (
                                    <button className="fs-btn" onClick={onCancelAllUploads}>{t('fileSystem.upload.cancelAll', '全部取消')}</button>
                                )}
                                {uploadSummary.hasSuccess && (
                                    <button className="fs-btn" onClick={onClearCompletedUploads}>{t('fileSystem.upload.clearCompleted', '清除已完成')}</button>
                                )}
                            </div>
                        </div>
                        {!uploadListCollapsed && (
                            <div className="fs-upload-list">
                                {uploadEntries.map((entry) => (
                                    <UploadQueueItem
                                        key={entry.id}
                                        entry={entry}
                                        onCancel={() => onCancelUploadEntry(entry)}
                                        onRetry={() => onRetryUploadEntry(entry)}
                                        onDismiss={() => onDismissUploadEntry(entry.id)}
                                    />
                                ))}
                            </div>
                        )}
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
                        <div className="fs-empty">{t('fileSystem.list.loading', '讀取中…')}</div>
                    ) : items.length === 0 ? (
                        <div className="fs-empty">{t('fileSystem.list.empty', '這裡還沒有檔案或資料夾')}</div>
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
                            <div className="fs-preview-title">
                                {previewEntry.isNew ? t('fileSystem.preview.titleNew', '新增檔案（尚未儲存）：') : t('fileSystem.preview.titleExisting', '預覽：')}{previewEntry.name}
                            </div>
                            <div className="fs-preview-actions">
                                <button className="fs-btn" onClick={() => setPreviewEntry(null)}>{t('fileSystem.preview.close', '關閉')}</button>
                                {!previewEntry.isNew && (
                                    <button className="fs-btn" onClick={() => onDownload(previewEntry)}>{t('fileSystem.preview.download', '下載')}</button>
                                )}
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
                                <object data={previewEntry.objectUrl} type="application/pdf" className="fs-pdf">{t('fileSystem.preview.pdfFallback', 'PDF 無法預覽，請下載')}</object>
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
                                            {saving ? t('fileSystem.preview.saving', '儲存中…') : t('fileSystem.preview.save', '儲存')}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {!['image', 'audio', 'video', 'pdf', 'text'].includes(previewEntry.kind) && (
                                <div className="fs-generic">{t('fileSystem.preview.unsupported', '無法預覽此檔案，請下載查看。')}</div>
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

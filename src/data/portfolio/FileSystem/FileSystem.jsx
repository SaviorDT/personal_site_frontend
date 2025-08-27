import React, { useEffect, useMemo, useRef, useState } from 'react';
import './FileSystem.css';
import { listDirectory, createFolder, createEmptyFile, uploadFile, uploadFolder, deleteFile, deleteFolder, renameFile, renameFolder, downloadFile, getFileEntry, getTextContent, saveTextContent, pathToString } from './fileService';
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
            for (const f of files) {
                await uploadFile(path, f);
            }
            await refresh();
        } catch (e) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
            ev.target.value = '';
        }
    };

    const onUploadFolder = async (ev) => {
        const files = Array.from(ev.target.files || []);
        if (!files.length) return;
        setLoading(true);
        setError('');
        try {
            await uploadFolder(path, files);
            await refresh();
        } catch (e) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
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

    const onOpenFile = async (name) => {
        try {
            const entry = await getFileEntry(path, name);
            setPreviewEntry(entry);
            if (entry.kind === 'text') {
                const txt = await getTextContent(path, name);
                setTextDraft(txt);
            } else {
                setTextDraft('');
            }
        } catch (e) {
            setError(e.message || String(e));
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

import React from 'react';

function formatBytes(bytes) {
    if (bytes === 0 || bytes == null) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const kindEmoji = (kind) => {
    switch (kind) {
        case 'image': return '🖼️';
        case 'audio': return '🎵';
        case 'video': return '🎬';
        case 'pdf': return '📄';
        case 'text': return '📝';
        default: return '📦';
    }
};

const FileItem = ({ name, size, onOpen, onDelete, onDownload, onRename, onMove, kind }) => {
    return (
        <div className="fs-item" role="button" tabIndex={0} onDoubleClick={onOpen} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
            <div className="fs-item-icon">{kindEmoji(kind)}</div>
            <div className="fs-item-main">
                <div className="fs-item-name">{name}</div>
                <div className="fs-item-meta">{formatBytes(size)}</div>
            </div>
            <div className="fs-item-actions">
                <button className="fs-link" onClick={onOpen}>預覽</button>
                <button className="fs-link" onClick={onDownload}>下載</button>
                {onRename && <button className="fs-link" onClick={onRename}>重新命名</button>}
                {onMove && <button className="fs-link" onClick={onMove}>移動</button>}
                <button className="fs-link danger" onClick={onDelete}>刪除</button>
            </div>
        </div>
    );
};

export default FileItem;

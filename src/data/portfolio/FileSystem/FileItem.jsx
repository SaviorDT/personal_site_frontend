import React from 'react';
import { useTranslation } from 'react-i18next';

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

const FileItem = ({ name, size, onOpen, onDelete, onDownload, onRename, onMove, onShare, kind }) => {
    const { t } = useTranslation();
    return (
        <div className="fs-item" role="button" tabIndex={0} onDoubleClick={onOpen} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
            <div className="fs-item-icon">{kindEmoji(kind)}</div>
            <div className="fs-item-main">
                <div className="fs-item-name" title={name}>{name}</div>
                <div className="fs-item-meta">{formatBytes(size)}</div>
            </div>
            <div className="fs-item-actions">
                <button className="fs-link" onClick={onOpen}>{t('fileSystem.item.preview', '預覽')}</button>
                <button className="fs-link" onClick={onDownload}>{t('fileSystem.item.download', '下載')}</button>
                {onRename && <button className="fs-link" onClick={onRename}>{t('fileSystem.item.rename', '重新命名')}</button>}
                {onMove && <button className="fs-link" onClick={onMove}>{t('fileSystem.item.move', '移動')}</button>}
                {onShare && <button className="fs-link" onClick={onShare}>{t('fileSystem.item.share', '分享')}</button>}
                <button className="fs-link danger" onClick={onDelete}>{t('fileSystem.item.delete', '刪除')}</button>
            </div>
        </div>
    );
};

export default FileItem;

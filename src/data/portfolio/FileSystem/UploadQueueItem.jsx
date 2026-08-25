import React from 'react';
import { useTranslation } from 'react-i18next';

function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const idx = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const val = bytes / Math.pow(1024, idx);
    return `${val.toFixed(val >= 100 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

// 單一檔案的上傳進度列：uploading 時顯示取消，failed/cancelled 時顯示重試，
// 非 uploading 一律可移除（success 也可以單獨移除，不用等「清除已完成」）
const UploadQueueItem = ({ entry, onCancel, onRetry, onDismiss }) => {
    const { t } = useTranslation();
    const statusLabel = {
        uploading: t('fileSystem.upload.status.uploading', '上傳中'),
        success: t('fileSystem.upload.status.success', '完成'),
        failed: t('fileSystem.upload.status.failed', '失敗'),
        cancelled: t('fileSystem.upload.status.cancelled', '已取消'),
    };
    const percent = entry.size > 0
        ? Math.min(100, (entry.uploadedBytes / entry.size) * 100)
        : (entry.status === 'success' ? 100 : 0);

    return (
        <div className={`fs-upload-row fs-upload-row--${entry.status}`}>
            <div className="fs-upload-row-main">
                <div className="fs-upload-row-name" title={entry.name}>{entry.name}</div>
                <div className="fs-progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                    <div className="fs-progress-fill" style={{ width: `${percent.toFixed(2)}%` }} />
                </div>
                <div className="fs-upload-row-meta">
                    <span className={`fs-upload-status fs-upload-status--${entry.status}`}>{statusLabel[entry.status]}</span>
                    <span>{formatBytes(entry.uploadedBytes)} / {formatBytes(entry.size)}</span>
                    {entry.error && <span className="fs-upload-error" title={entry.error}>{entry.error}</span>}
                </div>
            </div>
            <div className="fs-upload-row-actions">
                {entry.status === 'uploading' && <button className="fs-link" onClick={onCancel}>{t('fileSystem.upload.cancel', '取消')}</button>}
                {(entry.status === 'failed' || entry.status === 'cancelled') && <button className="fs-link" onClick={onRetry}>{t('fileSystem.upload.retry', '重試')}</button>}
                {entry.status !== 'uploading' && (
                    <button className="fs-link" onClick={onDismiss} aria-label={t('fileSystem.upload.dismiss', '移除此列')} title={t('fileSystem.upload.dismiss', '移除此列')}>✕</button>
                )}
            </div>
        </div>
    );
};

export default UploadQueueItem;

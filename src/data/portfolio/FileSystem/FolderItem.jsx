import React from 'react';
import { useTranslation } from 'react-i18next';

const FolderItem = ({ name, onOpen, onDelete, onRename, onMove }) => {
    const { t } = useTranslation();
    return (
        <div className="fs-item" role="button" tabIndex={0} onDoubleClick={onOpen} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
            <div className="fs-item-icon">📁</div>
            <div className="fs-item-main">
                <div className="fs-item-name" title={name}>{name}</div>
                <div className="fs-item-meta">{t('fileSystem.item.folderLabel', '資料夾')}</div>
            </div>
            <div className="fs-item-actions">
                <button className="fs-link" onClick={onOpen}>{t('fileSystem.item.open', '開啟')}</button>
                {onRename && <button className="fs-link" onClick={onRename}>{t('fileSystem.item.rename', '重新命名')}</button>}
                {onMove && <button className="fs-link" onClick={onMove}>{t('fileSystem.item.move', '移動')}</button>}
                <button className="fs-link danger" onClick={onDelete}>{t('fileSystem.item.delete', '刪除')}</button>
            </div>
        </div>
    );
};

export default FolderItem;

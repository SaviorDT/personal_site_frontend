import React from 'react';

const FolderItem = ({ name, onOpen, onDelete, onRename, onMove }) => {
    return (
        <div className="fs-item" role="button" tabIndex={0} onDoubleClick={onOpen} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
            <div className="fs-item-icon">📁</div>
            <div className="fs-item-main">
                <div className="fs-item-name">{name}</div>
                <div className="fs-item-meta">資料夾</div>
            </div>
            <div className="fs-item-actions">
                <button className="fs-link" onClick={onOpen}>開啟</button>
                {onRename && <button className="fs-link" onClick={onRename}>重新命名</button>}
                {onMove && <button className="fs-link" onClick={onMove}>移動</button>}
                <button className="fs-link danger" onClick={onDelete}>刪除</button>
            </div>
        </div>
    );
};

export default FolderItem;

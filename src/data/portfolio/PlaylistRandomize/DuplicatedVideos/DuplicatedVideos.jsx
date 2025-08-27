import React, { useState } from 'react';
import './DuplicatedVideos.css';

const DuplicatedVideos = ({ playlistData, onRemoveVideos }) => {
    const [selected, setSelected] = useState(new Set());

    if (!playlistData?.videos) {
        return <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>請先載入播放清單</div>;
    }

    const duplicates = playlistData.videos.filter(v => v.isDuplicate);
    if (duplicates.length === 0) {
        return <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>沒有重複的影片</div>;
    }

    const toggle = (id) => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    const toggleAll = () => {
        if (selected.size === duplicates.length) setSelected(new Set());
        else setSelected(new Set(duplicates.map(v => v.id)));
    };

    const removeSelected = () => {
        if (selected.size === 0) {
            alert('請先選擇要刪除的影片');
            return;
        }
        const confirmMessage = `確定要從播放清單中移除 ${selected.size} 部重複影片嗎？\n\n注意：這個操作只會從本地資料中移除，不會影響 YouTube 上的實際播放清單。`;
        if (window.confirm(confirmMessage)) {
            onRemoveVideos(Array.from(selected));
            setSelected(new Set());
        }
    };

    return (
        <div className="dup-videos">
            <div className="dup-header">
                <h3>重複的影片 ({duplicates.length})</h3>
                <div className="control-buttons">
                    <button className="btn btn-secondary" onClick={toggleAll}>
                        {selected.size === duplicates.length ? '取消全選' : '全選'}
                    </button>
                    <button className="btn btn-danger" onClick={removeSelected} disabled={selected.size === 0}>
                        移除選中的影片 ({selected.size})
                    </button>
                </div>
            </div>

            <div className="dup-list">
                {duplicates.map((v) => (
                    <div key={v.id} className={`dup-item ${selected.has(v.id) ? 'selected' : ''}`}>
                        <div className="item-checkbox">
                            <input type="checkbox" checked={selected.has(v.id)} onChange={() => toggle(v.id)} />
                        </div>
                        <div className="item-thumbnail">
                            {v.thumbnail ? <img src={v.thumbnail} alt={v.title} /> : <div className="no-thumbnail">無預覽圖</div>}
                        </div>
                        <div className="item-info">
                            <h4 className="item-title">{v.title}</h4>
                            <div className="item-meta">
                                <span className="meta-duration">時長: {v.duration}</span>
                                <span className="meta-position">序號: {v.position + 1}</span>
                                <span className="meta-channel">頻道: {v.channelTitle}</span>
                            </div>
                            {v.description && (
                                <p className="item-description">
                                    {v.description.length > 100 ? `${v.description.substring(0, 100)}...` : v.description}
                                </p>
                            )}
                        </div>
                        <div className="item-status status-duplicate">重複</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DuplicatedVideos;

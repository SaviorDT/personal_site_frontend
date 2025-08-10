import React, { useState } from 'react';
import './UnavailableVideos.css';

const UnavailableVideos = ({ playlistData, onRemoveVideos }) => {
    const [selectedVideos, setSelectedVideos] = useState(new Set());

    if (!playlistData || !playlistData.videos) {
        return (
            <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>
                請先載入播放清單
            </div>
        );
    }

    // 過濾出無法播放的影片
    const unavailableVideos = playlistData.videos.filter(video =>
        video.status !== 'playable'
    );

    if (unavailableVideos.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>
                目前沒有無法播放的影片
            </div>
        );
    }

    // 處理單個影片選擇
    const handleVideoSelect = (videoId) => {
        const newSelected = new Set(selectedVideos);
        if (newSelected.has(videoId)) {
            newSelected.delete(videoId);
        } else {
            newSelected.add(videoId);
        }
        setSelectedVideos(newSelected);
    };

    // 全選/取消全選
    const handleSelectAll = () => {
        if (selectedVideos.size === unavailableVideos.length) {
            setSelectedVideos(new Set());
        } else {
            setSelectedVideos(new Set(unavailableVideos.map(video => video.id)));
        }
    };

    // 刪除選中的影片
    const handleRemoveSelected = () => {
        if (selectedVideos.size === 0) {
            alert('請先選擇要刪除的影片');
            return;
        }

        const confirmMessage = `確定要從播放清單中移除 ${selectedVideos.size} 部影片嗎？\n\n注意：這個操作只會從本地資料中移除，不會影響 YouTube 上的實際播放清單。`;

        if (window.confirm(confirmMessage)) {
            onRemoveVideos(Array.from(selectedVideos));
            setSelectedVideos(new Set());
        }
    };

    // 獲取狀態顯示文字
    const getStatusText = (status) => {
        switch (status) {
            case 'private':
                return '私人影片';
            case 'unlisted':
                return '未列出';
            case 'deleted':
                return '已刪除';
            case 'unavailable':
            default:
                return '無法播放';
        }
    };

    // 獲取狀態樣式類別
    const getStatusClass = (status) => {
        switch (status) {
            case 'private':
                return 'status-private';
            case 'unlisted':
                return 'status-unlisted';
            case 'deleted':
                return 'status-deleted';
            case 'unavailable':
            default:
                return 'status-unavailable';
        }
    };

    return (
        <div className="unavailable-videos">
            <div className="unavailable-header">
                <h3>無法播放的影片 ({unavailableVideos.length})</h3>
                <div className="control-buttons">
                    <button
                        className="btn btn-secondary"
                        onClick={handleSelectAll}
                    >
                        {selectedVideos.size === unavailableVideos.length ? '取消全選' : '全選'}
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={handleRemoveSelected}
                        disabled={selectedVideos.size === 0}
                    >
                        移除選中的影片 ({selectedVideos.size})
                    </button>
                </div>
            </div>

            <div className="unavailable-list">
                {unavailableVideos.map((video, index) => (
                    <div
                        key={video.id}
                        className={`unavailable-item ${selectedVideos.has(video.id) ? 'selected' : ''}`}
                    >
                        <div className="item-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedVideos.has(video.id)}
                                onChange={() => handleVideoSelect(video.id)}
                            />
                        </div>

                        <div className="item-thumbnail">
                            {video.thumbnail ? (
                                <img src={video.thumbnail} alt={video.title} />
                            ) : (
                                <div className="no-thumbnail">無預覽圖</div>
                            )}
                        </div>

                        <div className="item-info">
                            <h4 className="item-title">{video.title}</h4>
                            <div className="item-meta">
                                <span className="meta-duration">時長: {video.duration}</span>
                                <span className="meta-position">序號: {video.position + 1}</span>
                                <span className="meta-channel">頻道: {video.channelTitle}</span>
                            </div>
                            {video.description && (
                                <p className="item-description">
                                    {video.description.length > 100
                                        ? `${video.description.substring(0, 100)}...`
                                        : video.description
                                    }
                                </p>
                            )}
                        </div>

                        <div className={`item-status ${getStatusClass(video.status)}`}>
                            {getStatusText(video.status)}
                        </div>
                    </div>
                ))}
            </div>

            {selectedVideos.size > 0 && (
                <div className="selection-summary">
                    已選擇 {selectedVideos.size} 部影片
                </div>
            )}
        </div>
    );
};

export default UnavailableVideos;

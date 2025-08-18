import React, { useState, useMemo, useEffect, useRef } from 'react';
import './VideoList.css';

const VideoList = ({ playlistData, onPlayVideo, currentPlaying, playRecords = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(50);
  const containerRef = useRef(null);

  const ITEM_HEIGHT = 120; // 每個項目的高度
  const BUFFER_SIZE = 10; // 緩衝區大小

  // 計算每個影片的播放次數
  const playCountMap = useMemo(() => {
    const countMap = {};
    playRecords.forEach(record => {
      countMap[record.videoId] = (countMap[record.videoId] || 0) + 1;
    });
    return countMap;
  }, [playRecords]);

  // 過濾影片基於搜尋關鍵字
  const filteredVideos = useMemo(() => {
    if (!playlistData?.videos) return [];

    if (!searchTerm.trim()) {
      return playlistData.videos;
    }

    return playlistData.videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [playlistData?.videos, searchTerm]);

  // 計算可見範圍
  const calculateVisibleRange = (videoList = filteredVideos) => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;

    const newStartIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);
    const newEndIndex = Math.min(videoList.length, newStartIndex + visibleCount + BUFFER_SIZE * 2);

    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  };

  // 處理滾動事件
  const handleScroll = () => {
    calculateVisibleRange(filteredVideos);
  };

  // 可見的影片項目
  const visibleVideos = useMemo(() => {
    return filteredVideos.slice(startIndex, endIndex).map((video, index) => ({
      ...video,
      virtualIndex: startIndex + index,
      originalIndex: playlistData?.videos.indexOf(video) || 0
    }));
  }, [filteredVideos, startIndex, endIndex, playlistData?.videos]);

  // 當篩選結果改變時重新計算可見範圍
  useEffect(() => {
    setStartIndex(0);
    calculateVisibleRange(filteredVideos);
  }, [filteredVideos]);

  // 綁定滾動事件
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      calculateVisibleRange(filteredVideos);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [filteredVideos]);

  if (!playlistData || !playlistData.videos) {
    return (
      <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>
        請先載入播放清單
      </div>
    );
  }

  const totalHeight = filteredVideos.length * ITEM_HEIGHT;

  return (
    <div className="video-list-wrapper">
      {/* 搜尋框 - 固定在頂部 */}
      <div className="search-container">
        <input
          type="text"
          placeholder="搜尋影片標題..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="clear-search-btn"
            title="清除搜尋"
          >
            ✕
          </button>
        )}
      </div>

      {/* 搜尋結果統計 */}
      {searchTerm && (
        <div className="search-results-info">
          找到 {filteredVideos.length} 個結果
          {filteredVideos.length !== playlistData.videos.length &&
            ` (共 ${playlistData.videos.length} 個影片)`
          }
        </div>
      )}

      {/* 虛擬化影片列表 - 可滾動區域 */}
      {filteredVideos.length === 0 && searchTerm ? (
        <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>
          未找到符合「{searchTerm}」的影片
        </div>
      ) : (
        <div
          ref={containerRef}
          className="video-container"
          style={{
            border: '1px solid #333',
            borderRadius: '8px',
            position: 'relative'
          }}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${startIndex * ITEM_HEIGHT}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }}
            >
              {visibleVideos.map((video) => {
                const isCurrentlyPlaying = currentPlaying && currentPlaying.id === video.id;
                const isPlayable = video.status === 'playable';
                const playCount = playCountMap[video.id] || 0;

                return (
                  <div
                    key={video.id}
                    className={`video-item ${isCurrentlyPlaying ? 'current-playing' : ''}`}
                    style={{
                      height: ITEM_HEIGHT,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      borderBottom: '1px solid #444',
                      backgroundColor: video.virtualIndex % 2 === 0 ? '#2a2a2a' : '#333'
                    }}
                  >
                    <div className="video-thumbnail">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          style={{
                            width: '120px',
                            height: '68px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '120px',
                          height: '68px',
                          backgroundColor: '#555',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}>
                          {isCurrentlyPlaying ? '▶' : '🎵'}
                        </div>
                      )}
                      {isCurrentlyPlaying && (
                        <div className="playing-indicator">
                          <span className="playing-icon">▶</span>
                          播放中
                        </div>
                      )}
                    </div>

                    <div className="video-info" style={{ marginLeft: '16px', flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '16px',
                        lineHeight: '1.3'
                      }}>
                        {video.title}
                      </h4>
                      <div className="video-meta" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        fontSize: '12px',
                        color: '#999'
                      }}>
                        <span>時長: {video.duration}</span>
                        <span>序號: {video.originalIndex + 1}</span>
                        <span>頻道: {video.channelTitle}</span>
                        {playCount > 0 && (
                          <span style={{
                            color: '#4A90E2',
                            fontWeight: 'bold'
                          }}>
                            播放次數: {playCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="video-actions" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}>
                      <div className={`video-status ${isPlayable ? 'status-playable' : 'status-unavailable'}`}>
                        {isPlayable ? '可播放' : '無法播放'}
                      </div>
                      {isPlayable && (
                        <button
                          className="btn-action btn-play"
                          onClick={() => onPlayVideo?.(video)}
                          disabled={isCurrentlyPlaying}
                          title={isCurrentlyPlaying ? '正在播放' : '立即播放'}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '4px',
                            backgroundColor: isCurrentlyPlaying ? '#666' : '#4A90E2',
                            color: 'white',
                            cursor: isCurrentlyPlaying ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isCurrentlyPlaying ? '播放中' : '播放'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {filteredVideos.length > 50 && (
            <div style={{
              position: 'fixed',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#fff',
              pointerEvents: 'none',
              zIndex: 1000,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(4px)'
            }}>
              顯示 {startIndex + 1}-{Math.min(endIndex, filteredVideos.length)} / {filteredVideos.length} 個影片
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoList;

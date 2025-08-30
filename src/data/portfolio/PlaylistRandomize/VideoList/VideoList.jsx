import React, { useState, useMemo, useEffect, useRef } from 'react';
import './VideoList.css';

const VideoList = ({ playlistData, onPlayVideo, currentPlaying, playRecords = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(20);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const ITEM_HEIGHT = isMobile ? 200 : 120; // 每個項目的高度（手機用較高避免擁擠）
  const BUFFER_SIZE = 10; // 緩衝區大小

  // 計算每個影片的播放次數
  const playCountMap = useMemo(() => {
    const countMap = {};
    playRecords.forEach(record => {
      countMap[record.videoId] = (countMap[record.videoId] || 0) + 1;
    });
    return countMap;
  }, [playRecords]);

  // 全量過濾結果（不做虛擬化切片）
  const allFilteredVideos = useMemo(() => {
    if (!playlistData?.videos) return [];
    if (!searchTerm.trim()) return playlistData.videos;
    const term = searchTerm.toLowerCase();
    return playlistData.videos.filter(video =>
      (video.title || '').toLowerCase().includes(term)
    );
  }, [playlistData?.videos, searchTerm]);

  // 計算可見範圍
  const calculateVisibleRange = (videoList = allFilteredVideos) => {
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
    calculateVisibleRange(allFilteredVideos);
  };

  // 可見的影片項目（僅桌機使用虛擬化）
  // 桌機虛擬化清單（附加虛擬索引與原始索引）
  const visibleVideos = useMemo(() => {
    if (isMobile) return allFilteredVideos.slice(startIndex, endIndex);
    const slice = allFilteredVideos.slice(startIndex, endIndex);
    return slice.map((video, index) => {
      const origIdx = playlistData?.videos?.findIndex(v => v.id === video.id);
      return {
        ...video,
        virtualIndex: startIndex + index,
        originalIndex: (origIdx != null && origIdx >= 0) ? origIdx : (startIndex + index)
      };
    });
  }, [allFilteredVideos, startIndex, endIndex, playlistData?.videos, isMobile]);

  // 手機端可見清單（也做切片避免一次渲染過多）
  const filteredVisibleVideos = useMemo(() => {
    return allFilteredVideos.slice(startIndex, endIndex);
  }, [allFilteredVideos, startIndex, endIndex]);

  // 當篩選結果改變時重新計算可見範圍
  useEffect(() => {
    setStartIndex(0);
    calculateVisibleRange(allFilteredVideos);
  }, [allFilteredVideos]);

  // 綁定滾動事件（桌機虛擬化）
  useEffect(() => {
    const container = containerRef.current;
    if (container && !isMobile) {
      container.addEventListener('scroll', handleScroll);
      calculateVisibleRange(allFilteredVideos);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [allFilteredVideos, isMobile]);

  // 手機偵測（避免使用已被棄用的 addListener/removeListener）
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);

    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }

    // Fallback：使用非棄用的 window.resize 監聽（不再使用 addListener）
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!playlistData || !playlistData.videos) {
    return (
      <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>
        請先載入播放清單
      </div>
    );
  }

  const totalHeight = isMobile ? undefined : allFilteredVideos.length * ITEM_HEIGHT;

  const renderRow = (video, rowIndex) => {
    // 若 video 內已有 originalIndex 則沿用；否則以 id 對照，最後才退回當前列索引
    const computedIdx = (playlistData?.videos?.findIndex?.(v => v.id === video.id) ?? -1);
    const originalIndex = (typeof video.originalIndex === 'number')
      ? video.originalIndex
      : (computedIdx >= 0 ? computedIdx : rowIndex);
    const isCurrentlyPlaying = currentPlaying && currentPlaying.id === video.id;
    const isPlayable = video.status === 'playable';
    const playCount = playCountMap[video.id] || 0;

    return (
      <div
        key={`${video.id}-${originalIndex}`}
        className={`video-item ${isCurrentlyPlaying ? 'current-playing' : ''}`}
        style={!isMobile ? {
          height: ITEM_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          borderBottom: '1px solid #444',
          backgroundColor: (rowIndex ?? 0) % 2 === 0 ? '#2a2a2a' : '#333'
        } : undefined}
      >
        <div className="video-thumbnail">
          {video.thumbnail ? (
            <img src={video.thumbnail} alt={video.title} />
          ) : (
            <div className="thumbnail-placeholder">
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

        <div className="video-info" style={{ marginLeft: isMobile ? 0 : '16px', flex: 1 }}>
          <h4>{video.title}</h4>
          <div className="video-meta">
            <span>時長: {video.duration}</span>
            <span>序號: {originalIndex + 1}</span>
            <span>頻道: {video.channelTitle}</span>
            {playCount > 0 && (
              <span className="meta-playcount">播放次數: {playCount}</span>
            )}
          </div>
        </div>

        <div className="video-actions">
          <div className={`video-status ${isPlayable ? 'status-playable' : 'status-unavailable'}`}>
            {isPlayable ? '可播放' : '無法播放'}
          </div>
          {isPlayable && (
            <button
              className="btn-action btn-play"
              onClick={() => onPlayVideo?.(video)}
              disabled={isCurrentlyPlaying}
              title={isCurrentlyPlaying ? '正在播放' : '立即播放'}
            >
              {isCurrentlyPlaying ? '播放中' : '播放'}
            </button>
          )}
        </div>
      </div>
    );
  };

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
          找到 {allFilteredVideos.length} 個結果
          {allFilteredVideos.length !== playlistData.videos.length &&
            ` (共 ${playlistData.videos.length} 個影片)`
          }
        </div>
      )}

      {/* 虛擬化影片列表 - 可滾動區域 */}
      {allFilteredVideos.length === 0 && searchTerm ? (
        <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>
          未找到符合「{searchTerm}」的影片
        </div>
      ) : (
        <div
          ref={containerRef}
          className="video-container"
          style={{ border: '1px solid #333', borderRadius: '8px', position: 'relative' }}
        >
          {isMobile ? (
            <div className="video-list-nonvirtual">
              {allFilteredVideos.map((video, idx) => renderRow(video, idx))}
            </div>
          ) : (
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
                {visibleVideos.map((video, idx) => renderRow(video, idx))}
              </div>
            </div>
          )}

          {!isMobile && allFilteredVideos.length > 50 && (
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
              顯示 {startIndex + 1}-{Math.min(endIndex, allFilteredVideos.length)} / {allFilteredVideos.length} 個影片
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoList;

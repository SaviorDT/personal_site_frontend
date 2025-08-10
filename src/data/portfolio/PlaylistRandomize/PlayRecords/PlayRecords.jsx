import React, { useState, useMemo } from 'react';
import './PlayRecords.css';
import VirtualizedHistory from './VirtualizedHistory';
import PlayCountChart from './PlayCountChart';

const PlayRecords = ({ playRecords, playlistData, totalPlayTimeSeconds, formatTotalPlayTime }) => {
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');

  // 根據 videoId 從 playlistData 中獲取 thumbnail
  const getThumbnailByVideoId = (videoId) => {
    if (!playlistData?.videos) return null;
    const video = playlistData.videos.find(v => v.id === videoId);
    return video?.thumbnail || null;
  };

  // 計算播放次數統計
  const getPlayCountStats = useMemo(() => {
    const playCount = {};
    playRecords.forEach(record => {
      playCount[record.videoId] = (playCount[record.videoId] || 0) + 1;
    });

    // 統計每個播放次數的影片數量
    const playCountDistribution = {};
    Object.values(playCount).forEach(count => {
      playCountDistribution[count] = (playCountDistribution[count] || 0) + 1;
    });

    return playCountDistribution;
  }, [playRecords]);

  // 獲取總統計 - 使用實際播放時間
  const getTotalStats = () => {
    const uniqueVideos = new Set(playRecords.map(r => r.videoId));

    return {
      totalPlays: playRecords.length,
      uniqueVideos: uniqueVideos.size,
      totalDuration: formatTotalPlayTime(totalPlayTimeSeconds)
    };
  };

  // 獲取今日播放統計
  const getTodayStats = () => {
    const today = new Date().toLocaleDateString();
    const todayRecords = playRecords.filter(record => record.date === today);
    return {
      totalPlays: todayRecords.length,
      uniqueVideos: new Set(todayRecords.map(r => r.videoId)).size
    };
  };

  // 獲取最常播放的影片
  const getMostPlayedVideos = () => {
    const playCount = {};
    playRecords.forEach(record => {
      playCount[record.videoId] = (playCount[record.videoId] || 0) + 1;
    });

    return Object.entries(playCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([videoId, count]) => {
        const record = playRecords.find(r => r.videoId === videoId);
        return { videoId, title: record?.title || 'Unknown', count };
      });
  };

  // 過濾播放歷史
  const filteredHistory = useMemo(() => {
    let filtered = [...playRecords];

    // 時間區間過濾
    if (startDateTime || endDateTime) {
      filtered = filtered.filter(record => {
        const recordTime = new Date(record.timestamp);
        let isValid = true;

        if (startDateTime) {
          const startTime = new Date(startDateTime);
          isValid = isValid && recordTime >= startTime;
        }

        if (endDateTime) {
          const endTime = new Date(endDateTime);
          isValid = isValid && recordTime <= endTime;
        }

        return isValid;
      });
    }

    // 標題搜尋
    if (historySearchTerm.trim()) {
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(historySearchTerm.toLowerCase())
      );
    }

    // 排序（最新的在前）
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return filtered;
  }, [playRecords, startDateTime, endDateTime, historySearchTerm]);

  // 根據顯示模式決定要顯示的記錄
  const displayedHistory = useMemo(() => {
    if (showAllHistory) {
      return filteredHistory;
    }
    return filteredHistory.slice(0, 10);
  }, [filteredHistory, showAllHistory]);

  const todayStats = getTodayStats();
  const totalStats = getTotalStats();
  const mostPlayedVideos = getMostPlayedVideos();

  return (
    <div className="play-records">
      {/* 總統計 */}
      <div className="record-section">
        <h3 className="record-title">總統計</h3>
        <div className="record-stats">
          <div className="record-stat-card">
            <div className="record-stat-number">{totalStats.totalPlays}</div>
            <div className="record-stat-label">總播放次數</div>
          </div>
          <div className="record-stat-card">
            <div className="record-stat-number">{totalStats.uniqueVideos}</div>
            <div className="record-stat-label">播放過的影片數</div>
          </div>
          <div className="record-stat-card">
            <div className="record-stat-number">{totalStats.totalDuration}</div>
            <div className="record-stat-label">總播放時長</div>
          </div>
        </div>
      </div>

      {/* 今日統計 */}
      <div className="record-section">
        <h3 className="record-title">今日統計</h3>
        <div className="record-stats">
          <div className="record-stat-card">
            <div className="record-stat-number">{todayStats.totalPlays}</div>
            <div className="record-stat-label">今日播放次數</div>
          </div>
          <div className="record-stat-card">
            <div className="record-stat-number">{todayStats.uniqueVideos}</div>
            <div className="record-stat-label">不同影片數</div>
          </div>
        </div>
      </div>

      {/* 播放次數分布圖表 */}
      <div className="record-section">
        <h3 className="record-title">播放次數分布</h3>
        <PlayCountChart data={getPlayCountStats} />
      </div>

      {/* 最常播放 */}
      <div className="record-section">
        <h3 className="record-title">最常播放</h3>
        <div className="video-list">
          {mostPlayedVideos.map((item, index) => (
            <div key={item.videoId} className="video-item">
              <div className="video-thumbnail">
                {getThumbnailByVideoId(item.videoId) ? (
                  <img src={getThumbnailByVideoId(item.videoId)} alt={item.title} />
                ) : (
                  <div className="thumbnail-placeholder">#{index + 1}</div>
                )}
              </div>
              <div className="video-info">
                <h4>{item.title}</h4>
                <div className="video-meta">播放次數: {item.count}</div>
              </div>
            </div>
          ))}
          {mostPlayedVideos.length === 0 && (
            <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>
              暫無播放記錄
            </div>
          )}
        </div>
      </div>

      {/* 播放歷史 */}
      <div className="record-section">
        <h3 className="record-title">播放歷史</h3>

        {/* 搜尋和過濾控制 */}
        <div className="history-controls">
          <div className="history-search">
            <input
              type="text"
              placeholder="搜尋影片標題..."
              value={historySearchTerm}
              onChange={(e) => setHistorySearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="datetime-filters">
              <label className="datetime-label">開始時間:</label>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="datetime-filter"
                title="選擇開始時間"
              />
              <label className="datetime-label">結束時間:</label>
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="datetime-filter"
                title="選擇結束時間"
              />
            </div>
            {(historySearchTerm || startDateTime || endDateTime) && (
              <button
                onClick={() => {
                  setHistorySearchTerm('');
                  setStartDateTime('');
                  setEndDateTime('');
                }}
                className="clear-filters-btn"
                title="清除所有過濾"
              >
                清除過濾
              </button>
            )}
          </div>

          <div className="view-controls">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showAllHistory}
                onChange={(e) => setShowAllHistory(e.target.checked)}
              />
              顯示所有歷史記錄
            </label>
            <div className="results-info">
              {filteredHistory.length > 0 && (
                <span className="results-count">
                  {showAllHistory ? (
                    `顯示 ${displayedHistory.length} 筆記錄`
                  ) : (
                    `顯示最近 ${Math.min(10, filteredHistory.length)} 筆 / 共 ${filteredHistory.length} 筆記錄`
                  )}
                </span>
              )}
              {(startDateTime || endDateTime) && (
                <span className="filter-info">
                  已套用時間篩選
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 虛擬化播放歷史列表 */}
        <VirtualizedHistory
          records={displayedHistory}
          getThumbnailByVideoId={getThumbnailByVideoId}
          showAllHistory={showAllHistory}
        />

        {playRecords.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>
            暫無播放記錄
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayRecords;

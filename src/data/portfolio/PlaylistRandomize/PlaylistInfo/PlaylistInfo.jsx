import React from 'react';
import './PlaylistInfo.css';

const PlaylistInfo = ({ playlistData, currentPlaying }) => {
  if (!playlistData) {
    return (
      <div className="playlist-info">
        <div className="playlist-header">
          <h3 className="panel-title">播放清單資訊</h3>
        </div>
        <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>
          請載入播放清單以查看詳細資訊
        </div>
      </div>
    );
  }

  return (
    <div className="playlist-info">
      <div className="playlist-header">
        <h3 className="panel-title">播放清單資訊</h3>
        <div className="playlist-title">{playlistData.title}</div>
      </div>

      <div className="playlist-stats">
        <div className="stat-item">
          <div className="stat-number">{playlistData.totalVideos}</div>
          <div className="stat-label">總影片數</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{playlistData.playableVideos}</div>
          <div className="stat-label">可播放</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{playlistData.unavailableVideos}</div>
          <div className="stat-label">無法播放</div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistInfo;

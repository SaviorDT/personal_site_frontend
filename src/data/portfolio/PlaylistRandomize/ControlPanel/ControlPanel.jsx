import React from 'react';
import './ControlPanel.css';

const ControlPanel = ({
  playlistId,
  setPlaylistId,
  token,
  setToken,
  onRefreshPlaylist,
  onRandomPlay,
  isLoading,
  isAutoPlay,
  onToggleAutoPlay
}) => {
  return (
    <div className="control-panel">
      <h2 className="panel-title">播放控制</h2>

      <div className="input-group">
        <label className="input-label" htmlFor="playlistId">
          YouTube 播放清單 ID
        </label>
        <input
          id="playlistId"
          type="text"
          className="input-field"
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
          placeholder="輸入播放清單 ID"
        />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="token">
          API Token (可選)
        </label>
        <input
          id="token"
          type="text"
          className="input-field"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="輸入 API Token 或留空"
        />
        <div className="input-hint">
          Token 用於獲取播放清單資訊。如果沒有 Token，可以留空並直接按下刷新清單按鈕，
          系統會提供其他選項來獲取播放清單資料。
        </div>
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={onRefreshPlaylist}
          disabled={isLoading}
        >
          {isLoading ? '載入中...' : '刷新清單'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={onRandomPlay}
          disabled={isLoading}
        >
          隨機播放
        </button>
      </div>

      <div className="playback-controls">
        <div className="control-row">
          <label className="control-label">
            <input
              type="checkbox"
              checked={isAutoPlay}
              onChange={onToggleAutoPlay}
              className="checkbox"
            />
            自動播放下一首
          </label>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

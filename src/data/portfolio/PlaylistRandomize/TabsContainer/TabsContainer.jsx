import React from 'react';
import VideoList from '../VideoList/VideoList';
import PlayRecords from '../PlayRecords/PlayRecords';
import UnavailableVideos from '../UnavailableVideos/UnavailableVideos';
import './TabsContainer.css';

const TabsContainer = ({
  activeTab,
  setActiveTab,
  playlistData,
  playRecords,
  onRemoveVideos,
  onPlayVideo,
  currentPlaying,
  totalPlayTimeSeconds,
  formatTotalPlayTime
}) => {
  return (
    <div className="tabs-container">
      <div className="tabs-nav">
        <button
          className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          影片清單
        </button>
        <button
          className={`tab-button ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          播放記錄
        </button>
        <button
          className={`tab-button ${activeTab === 'unavailable' ? 'active' : ''}`}
          onClick={() => setActiveTab('unavailable')}
        >
          無法播放的影片
          {playlistData && playlistData.videos && (
            <span className="tab-count">
              ({playlistData.videos.filter(v => v.status !== 'playable').length})
            </span>
          )}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'videos' && (
          <VideoList
            playlistData={playlistData}
            onPlayVideo={onPlayVideo}
            currentPlaying={currentPlaying}
            playRecords={playRecords}
          />
        )}
        {activeTab === 'records' && (
          <PlayRecords
            playRecords={playRecords}
            playlistData={playlistData}
            totalPlayTimeSeconds={totalPlayTimeSeconds}
            formatTotalPlayTime={formatTotalPlayTime}
          />
        )}
        {activeTab === 'unavailable' && (
          <UnavailableVideos
            playlistData={playlistData}
            onRemoveVideos={onRemoveVideos}
          />
        )}
      </div>
    </div>
  );
};

export default TabsContainer;

import React from 'react';
import './PlaylistRandomize.css';
import ControlPanel from './ControlPanel/ControlPanel';
import PlaylistInfo from './PlaylistInfo/PlaylistInfo';
import TabsContainer from './TabsContainer/TabsContainer';
import Modal from './Modal/Modal';
import YoutubePlayer from './YoutubePlayer/YoutubePlayer';
import { usePlaylistManager } from './hooks/usePlaylistManager';
import { metadata } from './PlaylistRandomizeMetadata';

// 項目詳細頁面組件
const PersonalWebsite = () => {
  const {
    playlistId,
    setPlaylistId,
    token,
    setToken,
    playlistData,
    currentPlaying,
    activeTab,
    setActiveTab,
    showModal,
    setShowModal,
    modalType,
    setModalType,
    playRecords,
    questions,
    setQuestions,
    successMessage,
    setSuccessMessage,
    isLoading,
    isAutoPlay,
    handleRefreshPlaylist,
    handleRandomPlay,
    handleTokenChoice,
    handleSubmitQuestions,
    handleRemoveVideos,
    handleVideoEnd,
    handleVideoError,
    playVideo,
    toggleAutoPlay,
    updatePlayingState,
    totalPlayTimeSeconds,
    formatTotalPlayTime
  } = usePlaylistManager();

  return (
    <div className="project-detail-page">
      <div className="project-header">
        <h1 className="project-title">{metadata.title}</h1>
        <p className="project-subtitle">{metadata.description}</p>

        <div className="project-meta">
          <span className="project-category">{metadata.category}</span>
          <span className="project-year">{metadata.year}</span>
          <span className="project-duration">{metadata.duration}</span>
        </div>
      </div>

      <div className="control-section">
        <ControlPanel
          playlistId={playlistId}
          setPlaylistId={setPlaylistId}
          token={token}
          setToken={setToken}
          onRefreshPlaylist={handleRefreshPlaylist}
          onRandomPlay={handleRandomPlay}
          isLoading={isLoading}
          isAutoPlay={isAutoPlay}
          onToggleAutoPlay={toggleAutoPlay}
        />

        <PlaylistInfo
          playlistData={playlistData}
          currentPlaying={currentPlaying}
        />
      </div>

      <div className="player-section">
        <YoutubePlayer
          currentVideo={currentPlaying}
          onVideoEnd={handleVideoEnd}
          onVideoError={handleVideoError}
          onPlayerStateChange={updatePlayingState}
          autoplay={true}
          width="100%"
        />
      </div>

      <TabsContainer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        playlistData={playlistData}
        playRecords={playRecords}
        onRemoveVideos={handleRemoveVideos}
        onPlayVideo={playVideo}
        currentPlaying={currentPlaying}
        totalPlayTimeSeconds={totalPlayTimeSeconds}
        formatTotalPlayTime={formatTotalPlayTime}
      />

      <Modal
        showModal={showModal}
        modalType={modalType}
        questions={questions}
        setQuestions={setQuestions}
        successMessage={successMessage}
        onClose={() => setShowModal(false)}
        onTokenChoice={handleTokenChoice}
        onSubmitQuestions={handleSubmitQuestions}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PersonalWebsite;

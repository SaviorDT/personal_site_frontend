import { useState, useEffect } from 'react';
import { YouTubeService } from '../services/youtubeService';
import { StorageUtils, STORAGE_KEYS } from '../utils/storageUtils';
import { usePlayerManager } from './usePlayerManager';
import apiClient, { handleApiError } from '@/services/apiClient';

export const usePlaylistManager = () => {
  // 使用播放器管理 Hook
  const {
    totalPlayTimeSeconds,
    isCurrentlyPlaying,
    updatePlayingState,
    formatTotalPlayTime
  } = usePlayerManager();

  // 狀態管理
  const [playlistId, setPlaylistId] = useState('');
  const [token, setToken] = useState('');
  const [playlistData, setPlaylistData] = useState(null);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'token-choice', 'tutorial', 'questions', 'token-success'
  const [playRecords, setPlayRecords] = useState([]);
  const [questions, setQuestions] = useState({
    question1: '',
    question2: '',
    question3: ''
  });
  const [successMessage, setSuccessMessage] = useState(''); // 成功訊息
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true); // 自動播放下一首

  // 組件掛載時從本地存儲載入數據
  useEffect(() => {
    const savedData = StorageUtils.loadAllSavedData();

    if (savedData.playlistId) setPlaylistId(savedData.playlistId);
    if (savedData.token) setToken(savedData.token);
    if (savedData.playRecords) setPlayRecords(savedData.playRecords);
    if (savedData.playlistData) setPlaylistData(savedData.playlistData);
  }, []);

  // 獲取播放清單數據
  const fetchPlaylistData = async () => {
    try {
      setIsLoading(true);

      const formattedData = await YouTubeService.getPlaylistData(playlistId, token);

      setPlaylistData(formattedData);
      StorageUtils.saveToLocalStorage(STORAGE_KEYS.PLAYLIST_DATA, formattedData);

      // 成功提示
      alert(`播放清單載入成功！\n` +
        `標題: ${formattedData.title}\n` +
        `總影片: ${formattedData.totalVideos}\n` +
        `可播放: ${formattedData.playableVideos}\n` +
        `私人/未列出: ${formattedData.privateVideos + formattedData.unlistedVideos}\n` +
        `已刪除: ${formattedData.deletedVideos}\n` +
        `不可用: ${formattedData.unavailableVideos}`);

    } catch (error) {
      console.error('載入播放清單失敗:', error);
      alert(`錯誤: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新播放清單
  const handleRefreshPlaylist = async () => {
    if (!playlistId.trim()) {
      alert('請輸入播放清單 ID');
      return;
    }

    // 防止重複觸發
    if (isLoading) {
      alert('正在載入中，請稍候...');
      return;
    }

    // 保存播放清單 ID
    StorageUtils.saveToLocalStorage(STORAGE_KEYS.PLAYLIST_ID, playlistId);

    // 如果沒有 token，顯示選擇彈窗
    if (!token.trim()) {
      setModalType('token-choice');
      setShowModal(true);
      return;
    }

    // 保存 token 並獲取播放清單
    StorageUtils.saveToLocalStorage(STORAGE_KEYS.TOKEN, token);

    try {
      await fetchPlaylistData();
    } catch (error) {
      // fetchPlaylistData 已經處理了錯誤顯示，這裡不需要額外處理
      console.error('刷新播放清單時發生錯誤:', error);
    }
  };

  // 開始隨機播放 - 純粹隨機，不考慮播放歷史
  const handleRandomPlay = () => {
    if (!playlistData || !playlistData.videos) {
      alert('請先載入播放清單');
      return;
    }

    const playableVideos = playlistData.videos.filter(video => video.status === 'playable');
    if (playableVideos.length === 0) {
      alert('沒有可播放的影片');
      return;
    }

    // 純粹隨機選擇
    const randomIndex = Math.floor(Math.random() * playableVideos.length);
    const selectedVideo = playableVideos[randomIndex];

    playVideo(selectedVideo);
  };

  // 播放指定影片
  const playVideo = (video) => {
    if (!video) return;

    setCurrentPlaying(video);

    // 記錄播放
    const newRecord = {
      videoId: video.id,
      title: video.title,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };

    const updatedRecords = [...playRecords, newRecord];
    setPlayRecords(updatedRecords);
    StorageUtils.saveToLocalStorage(STORAGE_KEYS.RECORDS, updatedRecords);
  };

  // 播放下一首 - 純粹隨機選擇
  const playNextVideo = () => {
    if (!isAutoPlay || !playlistData || !playlistData.videos) {
      return;
    }

    const playableVideos = playlistData.videos.filter(video => video.status === 'playable');
    if (playableVideos.length === 0) {
      return;
    }

    // 避免選到與當前相同的影片
    const filtered = currentPlaying
      ? playableVideos.filter(v => v.id !== currentPlaying.id)
      : playableVideos;

    if (filtered.length === 0) {
      // 只有一部可播放影片且就是當前影片，則不自動重播
      return;
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    const selectedVideo = filtered[randomIndex];

    // 延遲一秒播放下一首，避免太快切換
    setTimeout(() => {
      playVideo(selectedVideo);
    }, 1000);
  };

  // 處理影片播放結束
  const handleVideoEnd = (video) => {
    if (isAutoPlay) {
      playNextVideo();
    }
  };

  // 處理影片播放錯誤
  const handleVideoError = (error, video) => {
    console.error('影片播放錯誤:', error, video);

    // 如果是播放錯誤且開啟自動播放，嘗試播放下一首
    if (isAutoPlay) {
      setTimeout(() => {
        playNextVideo();
      }, 1000);
    } else {
      alert(`影片播放失敗: ${error.message}`);
    }
  };

  // 切換自動播放
  const toggleAutoPlay = () => {
    setIsAutoPlay(prev => !prev);
  };

  // 處理 token 選擇
  const handleTokenChoice = (choice) => {
    if (choice === 'self') {
      setModalType('tutorial');
    } else if (choice === 'server') {
      setModalType('questions');
    }
  };

  // 提交問題答案到後端獲取 token
  const handleSubmitQuestions = async () => {
    if (isLoading) {
      alert('正在處理中，請稍候...');
      return;
    }

    // 檢查是否所有問題都已回答
    const unansweredQuestions = Object.keys(questions).filter(key => !questions[key].trim());
    if (unansweredQuestions.length > 0) {
      alert('請回答所有問題');
      return;
    }

    try {
      setIsLoading(true);

      // 使用全域 apiClient 發送 GET 請求到後端
      const response = await apiClient.get('/get-yt-data-api-token', {
        params: {
          question1: questions.question1.trim(),
          question2: questions.question2.trim(),
          question3: questions.question3.trim()
        },
        // 這個請求不需要身份驗證，但仍會包含 httpOnly cookies
        requiresAuth: false
      });

      const data = response.data;

      if (data.success && data.token) {
        // 自動填入 token 到 ControlPanel
        setToken(data.token);
        StorageUtils.saveToLocalStorage(STORAGE_KEYS.TOKEN, data.token);

        // 設置成功訊息並顯示在 Modal 中
        setSuccessMessage(`Token 獲取成功！已自動填入欄位。\n\n您現在可以關閉此視窗並載入播放清單。`);
        setModalType('token-success');

      } else {
        alert(data.message || '驗證失敗，請檢查答案是否正確');
      }
    } catch (error) {
      console.error('提交問題時發生錯誤:', error);

      // 使用全域錯誤處理函數
      const errorResponse = handleApiError(error, '提交失敗，請稍後再試');
      alert(errorResponse.error);
    } finally {
      setIsLoading(false);
    }
  };

  // 從本地資料中移除選中的影片
  const handleRemoveVideos = (videoIds) => {
    if (!playlistData) {
      alert('沒有播放清單資料');
      return;
    }

    // 過濾掉選中的影片
    const updatedVideos = playlistData.videos.filter(video => !videoIds.includes(video.id));

    // 重新標記重複影片（移除後可能不再重複）
    const idCount = new Map();
    for (const v of updatedVideos) {
      idCount.set(v.id, (idCount.get(v.id) || 0) + 1);
    }
    for (const v of updatedVideos) {
      v.isDuplicate = (idCount.get(v.id) || 0) > 1;
    }

    // 重新計算統計資訊
    const playableVideos = updatedVideos.filter(video => video.status === 'playable');
    const unavailableVideos = updatedVideos.filter(video => video.status !== 'playable');
    const privateVideos = updatedVideos.filter(video => video.status === 'private');
    const deletedVideos = updatedVideos.filter(video => video.status === 'deleted');
    const unlistedVideos = updatedVideos.filter(video => video.status === 'unlisted');
    const duplicatedVideos = updatedVideos.filter(video => video.isDuplicate);

    const updatedPlaylistData = {
      ...playlistData,
      videos: updatedVideos,
      totalVideos: updatedVideos.length,
      playableVideos: playableVideos.length,
      unavailableVideos: unavailableVideos.length,
      privateVideos: privateVideos.length,
      deletedVideos: deletedVideos.length,
      unlistedVideos: unlistedVideos.length,
      duplicatedVideos: duplicatedVideos.length
    };

    setPlaylistData(updatedPlaylistData);
    StorageUtils.saveToLocalStorage(STORAGE_KEYS.PLAYLIST_DATA, updatedPlaylistData);

    alert(`已移除 ${videoIds.length} 部影片`);
  };

  return {
    // States
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
    totalPlayTimeSeconds,

    // Functions
    handleRefreshPlaylist,
    handleRandomPlay,
    handleTokenChoice,
    handleSubmitQuestions,
    handleRemoveVideos,
    handleVideoEnd,
    handleVideoError,
    playVideo,
    playNextVideo,
    toggleAutoPlay,
    updatePlayingState,
    formatTotalPlayTime
  };
};

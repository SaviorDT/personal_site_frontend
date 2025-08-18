import React, { useEffect, useRef, useState } from 'react';
import './YoutubePlayer.css';

const YoutubePlayer = ({
    currentVideo,
    onVideoEnd,
    onVideoReady,
    onVideoError,
    onPlayerStateChange,
    autoplay = true,
    width = '100%',
    height = '360'
}) => {
    const playerRef = useRef(null);
    const playerInstanceRef = useRef(null);
    // Keep latest props/state via refs to avoid stale closures inside YT event handlers
    const callbacksRef = useRef({ onVideoEnd, onVideoReady, onVideoError, onPlayerStateChange });
    const currentVideoRef = useRef(currentVideo);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [playerState, setPlayerState] = useState('unstarted'); // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: video cued

    // Keep refs in sync with latest props
    useEffect(() => {
        callbacksRef.current.onVideoEnd = onVideoEnd;
        callbacksRef.current.onVideoReady = onVideoReady;
        callbacksRef.current.onVideoError = onVideoError;
        callbacksRef.current.onPlayerStateChange = onPlayerStateChange;
    }, [onVideoEnd, onVideoReady, onVideoError, onPlayerStateChange]);

    useEffect(() => {
        currentVideoRef.current = currentVideo;
    }, [currentVideo]);

    // 載入 YouTube IFrame API
    useEffect(() => {
        const initAPI = () => {
            // 檢查是否已經載入 YouTube API
            if (window.YT && window.YT.Player) {
                initializePlayer();
                return;
            }

            // 如果尚未載入，則載入 YouTube IFrame API
            if (!window.YTAPILoading) {
                window.YTAPILoading = true;

                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            // YouTube API 載入完成後的回調
            window.onYouTubeIframeAPIReady = () => {
                initializePlayer();
            };
        };

        // 延遲初始化以確保 DOM 準備好
        const timer = setTimeout(initAPI, 100);

        return () => {
            clearTimeout(timer);
            // 清理播放器
            if (playerInstanceRef.current) {
                try {
                    playerInstanceRef.current.destroy();
                } catch (error) {
                    console.error('清理播放器時發生錯誤:', error);
                }
                playerInstanceRef.current = null;
            }
        };
    }, []);

    // 初始化播放器
    const initializePlayer = () => {
        if (!window.YT || !window.YT.Player || !playerRef.current) {
            return;
        }

        // 如果播放器已經存在，先清理
        if (playerInstanceRef.current) {
            try {
                playerInstanceRef.current.destroy();
            } catch (error) {
                console.error('清理舊播放器時發生錯誤:', error);
            }
            playerInstanceRef.current = null;
        }

        try {
            playerInstanceRef.current = new window.YT.Player(playerRef.current, {
                width: width,
                height: height,
                videoId: '', // 初始為空，稍後設置
                playerVars: {
                    autoplay: autoplay ? 1 : 0,
                    controls: 1,
                    disablekb: 0,
                    enablejsapi: 1,
                    fs: 1,
                    iv_load_policy: 3,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    showinfo: 0,
                    origin: window.location.origin
                },
                events: {
                    onReady: handlePlayerReady,
                    onStateChange: handlePlayerStateChange,
                    onError: handlePlayerError
                }
            });
        } catch (error) {
            console.error('初始化播放器失敗:', error);
            onVideoError?.(error);
        }
    };

    // 播放器準備就緒
    const handlePlayerReady = (event) => {
        setIsPlayerReady(true);
        callbacksRef.current.onVideoReady?.(event);

        // 如果有當前影片，立即載入
        if (currentVideo && currentVideo.id) {
            loadVideo(currentVideo.id);
        }
    };

    // 播放器狀態變化
    const handlePlayerStateChange = (event) => {
        const state = event.data;

        switch (state) {
            case window.YT.PlayerState.UNSTARTED:
                setPlayerState('unstarted');
                callbacksRef.current.onPlayerStateChange?.('unstarted');
                break;
            case window.YT.PlayerState.ENDED:
                setPlayerState('ended');
                callbacksRef.current.onPlayerStateChange?.('ended');
                // Use ref to ensure we call latest callback with latest video
                callbacksRef.current.onVideoEnd?.(currentVideoRef.current);
                break;
            case window.YT.PlayerState.PLAYING:
                setPlayerState('playing');
                callbacksRef.current.onPlayerStateChange?.('playing');
                break;
            case window.YT.PlayerState.PAUSED:
                setPlayerState('paused');
                callbacksRef.current.onPlayerStateChange?.('paused');
                break;
            case window.YT.PlayerState.BUFFERING:
                setPlayerState('buffering');
                callbacksRef.current.onPlayerStateChange?.('buffering');
                break;
            case window.YT.PlayerState.CUED:
                setPlayerState('cued');
                callbacksRef.current.onPlayerStateChange?.('cued');
                break;
            default:
                setPlayerState('unknown');
        }
    };

    // 播放器錯誤處理
    const handlePlayerError = (event) => {
        const errorCode = event.data;
        let errorMessage = '播放發生錯誤';

        switch (errorCode) {
            case 2:
                errorMessage = '影片 ID 無效';
                break;
            case 5:
                errorMessage = 'HTML5 播放器錯誤';
                break;
            case 100:
                errorMessage = '影片不存在或已被移除';
                break;
            case 101:
            case 150:
                errorMessage = '影片擁有者不允許在嵌入式播放器中播放';
                break;
            default:
                errorMessage = `未知錯誤 (代碼: ${errorCode})`;
        }

        console.error('YouTube 播放器錯誤:', errorMessage, event);
        callbacksRef.current.onVideoError?.(new Error(errorMessage), currentVideoRef.current);
    };

    // 載入影片
    const loadVideo = (videoId) => {
        if (!playerInstanceRef.current || !isPlayerReady || !videoId) {
            return;
        }

        // 檢查播放器方法是否可用
        if (typeof playerInstanceRef.current.loadVideoById !== 'function') {
            console.error('播放器方法不可用，播放器可能未完全初始化');
            // 嘗試重新初始化播放器
            setTimeout(() => {
                if (window.YT && window.YT.Player && playerRef.current) {
                    initializePlayer();
                }
            }, 1000);
            return;
        }

        try {
            if (autoplay) {
                playerInstanceRef.current.loadVideoById(videoId);
            } else {
                playerInstanceRef.current.cueVideoById(videoId);
            }
        } catch (error) {
            console.error('載入影片失敗:', error);
            onVideoError?.(error, currentVideo);
        }
    };

    // 當前影片變化時載入新影片
    useEffect(() => {
        if (currentVideo && currentVideo.id && isPlayerReady) {
            loadVideo(currentVideo.id);
        }
    }, [currentVideo, isPlayerReady]);

    // 播放控制方法
    const playVideo = () => {
        if (playerInstanceRef.current && isPlayerReady && typeof playerInstanceRef.current.playVideo === 'function') {
            playerInstanceRef.current.playVideo();
        }
    };

    const pauseVideo = () => {
        if (playerInstanceRef.current && isPlayerReady && typeof playerInstanceRef.current.pauseVideo === 'function') {
            playerInstanceRef.current.pauseVideo();
        }
    };

    const stopVideo = () => {
        if (playerInstanceRef.current && isPlayerReady && typeof playerInstanceRef.current.stopVideo === 'function') {
            playerInstanceRef.current.stopVideo();
        }
    };

    const seekTo = (seconds) => {
        if (playerInstanceRef.current && isPlayerReady && typeof playerInstanceRef.current.seekTo === 'function') {
            playerInstanceRef.current.seekTo(seconds, true);
        }
    };

    const setVolume = (volume) => {
        if (playerInstanceRef.current && isPlayerReady && typeof playerInstanceRef.current.setVolume === 'function') {
            playerInstanceRef.current.setVolume(Math.max(0, Math.min(100, volume)));
        }
    };

    // 暴露控制方法給父組件
    useEffect(() => {
        if (playerRef.current && isPlayerReady && playerInstanceRef.current) {
            playerRef.current.playerControls = {
                play: playVideo,
                pause: pauseVideo,
                stop: stopVideo,
                seekTo: seekTo,
                setVolume: setVolume,
                getCurrentTime: () => {
                    try {
                        return playerInstanceRef.current?.getCurrentTime() || 0;
                    } catch (error) {
                        console.error('獲取當前時間失敗:', error);
                        return 0;
                    }
                },
                getDuration: () => {
                    try {
                        return playerInstanceRef.current?.getDuration() || 0;
                    } catch (error) {
                        console.error('獲取影片長度失敗:', error);
                        return 0;
                    }
                },
                getPlayerState: () => playerState
            };
        }
    }, [isPlayerReady, playerState]);

    return (
        <div className="youtube-player-wrapper">
            {/* 播放器容器 */}
            <div className="youtube-player-container">
                <div
                    ref={playerRef}
                    className="youtube-player"
                    style={{ width, height }}
                />

                {/* 載入狀態 */}
                {!isPlayerReady && (
                    <div className="player-loading">
                        <div className="loading-spinner"></div>
                        <p>載入播放器中...</p>
                    </div>
                )}
            </div>

            {/* 當前播放信息 */}
            {currentVideo && (
                <div className="current-video-info">
                    <h3 className="video-title">{currentVideo.title}</h3>
                    <div className="video-meta">
                        <span className="video-channel">{currentVideo.channelTitle}</span>
                        <span className="video-duration">{currentVideo.duration}</span>
                        <span className="player-status">狀態: {getStatusText(playerState)}</span>
                    </div>
                </div>
            )}

            {/* 沒有影片時的提示 */}
            {!currentVideo && isPlayerReady && (
                <div className="no-video-message">
                    <p>請點擊「隨機播放」開始播放影片</p>
                </div>
            )}
        </div>
    );
};

// 獲取狀態文字
const getStatusText = (state) => {
    switch (state) {
        case 'unstarted': return '未開始';
        case 'ended': return '已結束';
        case 'playing': return '播放中';
        case 'paused': return '已暫停';
        case 'buffering': return '緩衝中';
        case 'cued': return '已載入';
        default: return '未知';
    }
};

export default YoutubePlayer;

import { useState, useEffect, useRef } from 'react';
import { StorageUtils, STORAGE_KEYS } from '../utils/storageUtils';

// 播放器相關的 Hook
export const usePlayerManager = () => {
    // 播放時間追蹤
    const [totalPlayTimeSeconds, setTotalPlayTimeSeconds] = useState(0);
    const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState(false);
    const timerRef = useRef(null);
    const totalPlayTimeRef = useRef(0);

    // 組件掛載時載入保存的播放時間
    useEffect(() => {
        const savedTime = StorageUtils.getIntFromLocalStorage(STORAGE_KEYS.TOTAL_PLAY_TIME, 0);
        setTotalPlayTimeSeconds(savedTime);
        totalPlayTimeRef.current = savedTime;
    }, []);

    // 播放時間追蹤 - 每秒檢查播放狀態
    useEffect(() => {
        if (isCurrentlyPlaying) {
            // 確保清除舊的 timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            timerRef.current = setInterval(() => {
                setTotalPlayTimeSeconds(prev => {
                    const newTotal = prev + 1;
                    totalPlayTimeRef.current = newTotal;

                    // 每30秒保存一次到本地存儲（減少I/O操作）
                    if (newTotal % 30 === 0) {
                        StorageUtils.saveToLocalStorage(STORAGE_KEYS.TOTAL_PLAY_TIME, newTotal);
                    }
                    return newTotal;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isCurrentlyPlaying]);

    // 組件卸載時保存播放時間
    useEffect(() => {
        return () => {
            // 組件卸載時保存當前播放時間（使用 ref 獲取最新值）
            StorageUtils.saveToLocalStorage(STORAGE_KEYS.TOTAL_PLAY_TIME, totalPlayTimeRef.current);
        };
    }, []);

    // 更新播放狀態（供 YoutubePlayer 調用）
    const updatePlayingState = (playerState) => {
        const playing = playerState === 'playing';
        setIsCurrentlyPlaying(playing);
    };

    // 格式化總播放時間
    const formatTotalPlayTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return {
        totalPlayTimeSeconds,
        isCurrentlyPlaying,
        updatePlayingState,
        formatTotalPlayTime
    };
};

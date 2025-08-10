// 本地存儲鍵值
export const STORAGE_KEYS = {
    PLAYLIST_ID: 'youtube_playlist_id',
    TOKEN: 'youtube_token',
    RECORDS: 'youtube_play_records',
    PLAYLIST_DATA: 'youtube_playlist_data',
    TOTAL_PLAY_TIME: 'youtube_total_play_time'
};

// 本地存儲工具類
export class StorageUtils {
    // 保存數據到本地存儲
    static saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (error) {
            console.error('保存到本地存儲失敗:', error);
        }
    }

    // 從本地存儲獲取數據
    static getFromLocalStorage(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) return defaultValue;

            // 嘗試解析 JSON，如果失敗則返回原始字符串
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error('從本地存儲讀取失敗:', error);
            return defaultValue;
        }
    }

    // 從本地存儲獲取整數
    static getIntFromLocalStorage(key, defaultValue = 0) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) return defaultValue;
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? defaultValue : parsed;
        } catch (error) {
            console.error('從本地存儲讀取整數失敗:', error);
            return defaultValue;
        }
    }

    // 移除本地存儲項目
    static removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('從本地存儲移除失敗:', error);
        }
    }

    // 清除所有相關的本地存儲
    static clearAllPlaylistData() {
        Object.values(STORAGE_KEYS).forEach(key => {
            this.removeFromLocalStorage(key);
        });
    }

    // 載入所有保存的數據
    static loadAllSavedData() {
        return {
            playlistId: this.getFromLocalStorage(STORAGE_KEYS.PLAYLIST_ID, ''),
            token: this.getFromLocalStorage(STORAGE_KEYS.TOKEN, ''),
            playRecords: this.getFromLocalStorage(STORAGE_KEYS.RECORDS, []),
            playlistData: this.getFromLocalStorage(STORAGE_KEYS.PLAYLIST_DATA, null),
            totalPlayTime: this.getIntFromLocalStorage(STORAGE_KEYS.TOTAL_PLAY_TIME, 0)
        };
    }
}

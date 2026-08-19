// 本地存儲鍵值
const STORAGE_KEY = 'find_number_game_best_time';

// 找數字遊戲的本地紀錄服務
const findNumberGameService = {
    // 讀取歷史最佳成績（秒），沒有紀錄則回傳 null
    getBestTime() {
        try {
            const value = localStorage.getItem(STORAGE_KEY);
            if (value === null) return null;
            const parsed = parseFloat(value);
            return isNaN(parsed) ? null : parsed;
        } catch (error) {
            console.error('讀取最佳紀錄失敗:', error);
            return null;
        }
    },

    // 儲存最佳成績（秒）
    saveBestTime(seconds) {
        try {
            localStorage.setItem(STORAGE_KEY, String(seconds));
        } catch (error) {
            console.error('儲存最佳紀錄失敗:', error);
        }
    }
};

export default findNumberGameService;

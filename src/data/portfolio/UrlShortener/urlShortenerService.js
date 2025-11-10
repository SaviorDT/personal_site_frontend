import apiClient from '@/services/apiClient';
import apiConfig from '@/config/api';

const urlShortenerService = {
    /**
     * 列出所有短網址
     * @returns {Promise<Array>} 短網址列表
     */
    async list() {
        try {
            const response = await apiClient.get(apiConfig.ENDPOINTS.URL_SHORTENER.LIST);
            // 後端返回格式: { data: [...] }
            const urls = response.data?.data || [];
            
            // 標準化數據格式，將大寫的 ID 轉換為小寫的 id，並檢查是否過期
            return urls.map(url => ({
                ...url,
                id: url.ID, // 將大寫 ID 轉換為小寫 id
                expired: url.expires_at ? new Date(url.expires_at) < new Date() : false
            }));
        } catch (error) {
            console.error('列出短網址失敗:', error);
            throw error;
        }
    },

    /**
     * 創建新的短網址
     * @param {Object} data - 短網址資料
     * @param {string} [data.key] - 自訂短網址 key（可為空，由後端生成）
     * @param {string} data.target_url - 目標網址（必填）
     * @param {string} [data.expires_in] - 過期時間（可選：1h, 12h, 1d, 7d, 30d）
     * @returns {Promise<Object>} 創建的短網址資料
     */
    async create(data) {
        try {
            const payload = {
                target_url: data.target_url,
            };

            if (data.key && data.key.trim()) {
                payload.key = data.key.trim();
            }

            if (data.expires_in) {
                payload.expires_in = data.expires_in;
            }

            const response = await apiClient.post(apiConfig.ENDPOINTS.URL_SHORTENER.CREATE, payload);
            const url = response.data?.data || response.data;
            
            // 標準化返回數據
            return {
                ...url,
                id: url.ID || url.id,
                expired: url.expires_at ? new Date(url.expires_at) < new Date() : false
            };
        } catch (error) {
            console.error('創建短網址失敗:', error);
            throw error;
        }
    },

    /**
     * 獲取單個短網址詳情
     * @param {string} id - 短網址 ID
     * @returns {Promise<Object>} 短網址詳情
     */
    async get(id) {
        try {
            const response = await apiClient.get(apiConfig.ENDPOINTS.URL_SHORTENER.DETAIL.replace('{id}', id));
            const url = response.data?.data || response.data;
            
            // 標準化返回數據
            return {
                ...url,
                id: url.ID || url.id,
                expired: url.expires_at ? new Date(url.expires_at) < new Date() : false
            };
        } catch (error) {
            console.error('獲取短網址詳情失敗:', error);
            throw error;
        }
    },

    /**
     * 更新短網址
     * @param {string} id - 短網址 ID
     * @param {Object} data - 更新資料
     * @param {string} [data.key] - 新的短網址 key（可為空）
     * @param {string} [data.target_url] - 新的目標網址（可為空）
     * @param {string} [data.expires_in] - 新的過期時間（可選）
     * @returns {Promise<Object>} 更新後的短網址資料
     */
    async update(id, data) {
        try {
            const payload = {};

            if (data.key !== undefined) {
                payload.key = data.key.trim() || null;
            }

            if (data.target_url !== undefined && data.target_url.trim()) {
                payload.target_url = data.target_url.trim();
            }

            if (data.expires_in !== undefined) {
                payload.expires_in = data.expires_in || null;
            }

            const response = await apiClient.patch(
                apiConfig.ENDPOINTS.URL_SHORTENER.DETAIL.replace('{id}', id),
                payload
            );
            const url = response.data?.data || response.data;
            
            // 標準化返回數據
            return {
                ...url,
                id: url.ID || url.id,
                expired: url.expires_at ? new Date(url.expires_at) < new Date() : false
            };
        } catch (error) {
            console.error('更新短網址失敗:', error);
            throw error;
        }
    },

    /**
     * 刪除短網址
     * @param {string} id - 短網址 ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await apiClient.delete(apiConfig.ENDPOINTS.URL_SHORTENER.DETAIL.replace('{id}', id));
        } catch (error) {
            console.error('刪除短網址失敗:', error);
            throw error;
        }
    },
};

export default urlShortenerService;

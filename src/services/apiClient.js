import axios from 'axios';
import apiConfig from '@/config/api';
import i18n from 'i18next';

// 創建全域 axios 實例
const apiClient = axios.create({
    baseURL: apiConfig.API_BASE_URL,
    timeout: apiConfig.TIMEOUT || 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
});

// 請求攔截器 - 可以添加 token 或其他全域請求處理
apiClient.interceptors.request.use(
    (config) => {
        // 可以在這裡添加 Authorization header 或其他全域請求配置
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 響應攔截器 - 處理錯誤
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 處理 401 錯誤（僅針對需要身份驗證的請求）
        if (error.response?.status === 401 && error.config?.requiresAuth !== false) {
            // Token 無效或過期，清除本地用戶信息
            localStorage.removeItem('user');

            // 觸發登出事件來更新 AuthContext
            window.dispatchEvent(new CustomEvent('auth-logout'));

            // 觸發顯示 AuthModal 的事件
            window.dispatchEvent(new CustomEvent('show-auth-modal', {
                detail: { mode: 'login' }
            }));
        }

        return Promise.reject(error);
    }
);

/**
 * 標準化錯誤處理函數
 * @param {Error} error - 錯誤對象
 * @param {string} defaultMessage - 默認錯誤信息
 * @returns {Object} 標準化的錯誤響應
 */
export const handleApiError = (error, defaultMessage) => {
    console.error('API Error:', error);

    let message = defaultMessage;
    let statusCode = null;

    if (error.response) {
        // 服務器響應錯誤
        statusCode = error.response.status;
        message = error.response.data?.message || error.response.data?.error || defaultMessage;
    } else if (error.request) {
        // 請求發送但沒有響應
        message = i18n.t('auth.api.network_error', { defaultValue: '網絡錯誤，請檢查網絡連接' });
    } else {
        // 其他錯誤
        message = error.message || defaultMessage;
    }

    return {
        success: false,
        error: message,
        statusCode: statusCode,
    };
};

// 導出 apiClient 實例
export default apiClient;

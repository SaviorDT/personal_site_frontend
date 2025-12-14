import axios from 'axios';
import apiConfig from '@/config/api';
import i18n from 'i18next';

// API 基礎 URL 配置
// 在開發環境中，Vite 代理會轉發 /api 請求到實際的 API 服務器
// 在生產環境中，使用絕對 URL
const getBaseURL = () => {
    // ✅ 開發環境：始終使用相對路徑，讓 Vite 代理處理轉發
    if (import.meta.env.DEV) {
        console.log('[API Client] Development mode: Using relative API path /api (Vite proxy will forward to backend)');
        return '/api';
    }

    // 生產環境：使用完整 API URL
    if (apiConfig.API_BASE_URL && apiConfig.API_BASE_URL.startsWith('http')) {
        console.log('[API Client] Production mode: Using full API URL:', apiConfig.API_BASE_URL);
        return apiConfig.API_BASE_URL;
    }

    // 預設使用相對路徑
    console.log('[API Client] Using relative API path /api');
    return '/api';
};

const calculatedBaseURL = getBaseURL();
console.log('[API Client] Base URL:', calculatedBaseURL);
console.log('[API Client] Window location:', window.location.origin);
console.log('[API Client] Config API_BASE_URL:', apiConfig.API_BASE_URL);

// 創建全域 axios 實例
const apiClient = axios.create({
    baseURL: calculatedBaseURL,
    timeout: apiConfig.TIMEOUT || 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
});

// 請求攔截器 - 可以添加 token 或其他全域請求處理
apiClient.interceptors.request.use(
    (config) => {
        // Debug: 顯示完整請求 URL
        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        console.log('[API Request]', config.method?.toUpperCase(), fullUrl, {
            params: config.params,
            withCredentials: config.withCredentials,
        });

        // 可以在這裡添加 Authorization header 或其他全域請求配置
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// 響應攔截器 - 處理錯誤
apiClient.interceptors.response.use(
    (response) => {
        console.log('[API Response] Status:', response.status, 'URL:', response.config.url);
        return response;
    },
    (error) => {
        // 詳細的錯誤日誌
        const errorInfo = {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data,
            code: error.code,
        };
        console.error('[API Response Error]', errorInfo);

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
    console.error('API Error details:', {
        hasResponse: !!error.response,
        hasRequest: !!error.request,
        message: error.message,
        config: error.config,
        statusCode: error.response?.status,
        responseData: error.response?.data,
    });

    let message = defaultMessage;
    let statusCode = null;

    if (error.response) {
        // 服務器響應錯誤
        statusCode = error.response.status;
        message = error.response.data?.message || error.response.data?.error || defaultMessage;
        console.error('Response error:', { statusCode, data: error.response.data });
    } else if (error.request) {
        // 請求發送但沒有響應
        console.error('Request sent but no response:', error.request);
        message = i18n.t('auth.api.network_error', { defaultValue: '網絡錯誤，請檢查網絡連接' });
    } else if (error.code === 'ECONNABORTED') {
        // 連線超時
        console.error('Request timeout');
        message = '請求超時，請檢查網絡連接';
    } else {
        // 其他錯誤
        console.error('Other error:', error.message);
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

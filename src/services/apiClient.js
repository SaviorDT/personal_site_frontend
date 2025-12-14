import axios from 'axios';

// Get base URL from environment variable or fallback to localhost
// Using VITE_API_URL which is the standard Vite environment variable prefix
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Ensure cookies are sent (for Auth)
});

// Request interceptor: add Authorization / X-CSRF-Token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Add CSRF token if available (though usually handled by cookie in Go)
        const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='));
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken.split('=')[1];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: handle token expiration and standard errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Helper to extract detailed error message
        const getErrorMessage = (err) => {
            // 1. Backend structured error: { error: "message" }
            if (err.response?.data?.error) {
                return err.response.data.error;
            }
            // 2. HTTP Status messages
            if (err.response?.status === 401) {
                return '請先登入';
            }
            if (err.response?.status === 403) {
                return '權限不足';
            }
            if (err.response?.status === 404) {
                return '找不到資源';
            }
            if (err.response?.status === 500) {
                return '伺服器內部錯誤';
            }
            // 3. Fallback
            return err.message || '發生未知錯誤';
        };

        const friendlyError = getErrorMessage(error);

        // Log detailed error for debugging
        console.warn('[ApiClient]', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            friendlyError
        });

        // Special handling for 401 (Unauthorized) - potentially redirect to login or clear token
        if (error.response?.status === 401) {
            // Optional: clear token if needed, or emit event
            // localStorage.removeItem('token');
        }

        // Reject with friendly string or object depending on your app needs
        // Returning friendly string here for easier UI display
        return Promise.reject(friendlyError);
    }
);

/**
 * 通用的 API 錯誤處理輔助函數
 * @param {Error} error - Axios 錯誤對象
 * @param {string} defaultMessage - 默認錯誤訊息
 * @returns {Object} 統一的錯誤響應格式 { success: false, message: string }
 */
export const handleApiError = (error, defaultMessage = '操作失敗') => {
    // 優先使用攔截器處理過的錯誤訊息（如果有的話，通常是 string）
    if (typeof error === 'string') {
        return {
            success: false,
            message: error
        };
    }

    // 如果攔截器回傳的是 Error 對象 (例如網絡錯誤)
    if (error?.message) {
        return {
            success: false,
            message: error.message
        };
    }

    return {
        success: false,
        message: defaultMessage
    };
};

export default apiClient;

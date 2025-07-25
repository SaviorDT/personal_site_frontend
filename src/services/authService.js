import axios from 'axios';
import apiConfig from '@/config/api';

// 創建 axios 實例
const apiClient = axios.create({
  baseURL: apiConfig.API_BASE_URL || 'http://localhost:8000/api',
  timeout: apiConfig.TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 添加認證 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    if (error.response?.status === 401) {
      // Token 過期或無效，清除本地存儲並重定向到登入頁
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // 這裡可以添加重定向邏輯
    }
    return Promise.reject(error);
  }
);

// Auth Service 類
class AuthService {
  
  /**
   * 用戶登入
   * @param {Object} credentials - 登入憑證
   * @param {string} credentials.email - 電子郵件
   * @param {string} credentials.password - 密碼
   * @returns {Promise} API 響應
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      
      // 登入成功後保存 token 和用戶信息
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        data: response.data,
        message: '登入成功'
      };
    } catch (error) {
      return this.handleError(error, '登入失敗');
    }
  }

  /**
   * 用戶註冊
   * @param {Object} userData - 註冊資料
   * @param {string} userData.name - 姓名/暱稱
   * @param {string} userData.email - 電子郵件
   * @param {string} userData.password - 密碼
   * @param {string} userData.confirmPassword - 確認密碼
   * @returns {Promise} API 響應
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
      });
      
      // 註冊成功後可以自動登入或要求用戶登入
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        data: response.data,
        message: '註冊成功'
      };
    } catch (error) {
      return this.handleError(error, '註冊失敗');
    }
  }

  /**
   * 用戶登出
   * @returns {Promise} API 響應
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
      
      // 清除本地存儲
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return {
        success: true,
        message: '登出成功'
      };
    } catch (error) {
      // 即使 API 調用失敗，也要清除本地存儲
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return {
        success: true,
        message: '登出成功'
      };
    }
  }

  /**
   * 獲取當前用戶信息
   * @returns {Promise} API 響應
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error, '獲取用戶信息失敗');
    }
  }

  /**
   * 刷新 Token
   * @returns {Promise} API 響應
   */
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh');
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError(error, 'Token 刷新失敗');
    }
  }

  /**
   * 社交登入
   * @param {string} provider - 社交平台 (google, facebook, github, line)
   * @param {Object} socialData - 社交平台返回的資料
   * @returns {Promise} API 響應
   */
  async socialLogin(provider, socialData) {
    try {
      const response = await apiClient.post(`/auth/social/${provider}`, {
        ...socialData,
        provider: provider,
      });
      
      // 登入成功後保存 token 和用戶信息
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        data: response.data,
        message: '登入成功'
      };
    } catch (error) {
      return this.handleError(error, `${provider} 登入失敗`);
    }
  }

  /**
   * 忘記密碼
   * @param {string} email - 電子郵件
   * @returns {Promise} API 響應
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email: email,
      });
      
      return {
        success: true,
        data: response.data,
        message: '重置密碼郵件已發送'
      };
    } catch (error) {
      return this.handleError(error, '發送重置密碼郵件失敗');
    }
  }

  /**
   * 重置密碼
   * @param {Object} resetData - 重置密碼資料
   * @param {string} resetData.token - 重置 token
   * @param {string} resetData.password - 新密碼
   * @param {string} resetData.confirmPassword - 確認新密碼
   * @returns {Promise} API 響應
   */
  async resetPassword(resetData) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token: resetData.token,
        password: resetData.password,
        confirmPassword: resetData.confirmPassword,
      });
      
      return {
        success: true,
        data: response.data,
        message: '密碼重置成功'
      };
    } catch (error) {
      return this.handleError(error, '密碼重置失敗');
    }
  }

  /**
   * 檢查用戶是否已登入
   * @returns {boolean} 是否已登入
   */
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * 獲取本地存儲的用戶信息
   * @returns {Object|null} 用戶信息
   */
  getLocalUser() {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * 獲取本地存儲的 token
   * @returns {string|null} Token
   */
  getLocalToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * 錯誤處理
   * @param {Error} error - 錯誤對象
   * @param {string} defaultMessage - 默認錯誤信息
   * @returns {Object} 標準化的錯誤響應
   */
  handleError(error, defaultMessage) {
    console.error('Auth Service Error:', error);
    
    let message = defaultMessage;
    let statusCode = null;
    
    if (error.response) {
      // 服務器響應錯誤
      statusCode = error.response.status;
      message = error.response.data?.message || error.response.data?.error || defaultMessage;
    } else if (error.request) {
      // 請求發送但沒有響應
      message = '網絡連接錯誤，請檢查您的網絡連接';
    } else {
      // 其他錯誤
      message = error.message || defaultMessage;
    }
    
    return {
      success: false,
      error: message,
      statusCode: statusCode,
    };
  }
}

// 創建並導出單例
const authService = new AuthService();
export default authService;

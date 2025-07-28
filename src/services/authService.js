import axios from 'axios';
import apiConfig from '@/config/api';
import i18n from 'i18next';

// 創建 axios 實例
const apiClient = axios.create({
  baseURL: apiConfig.API_BASE_URL,
  timeout: apiConfig.TIMEOUT || 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
});

// 響應攔截器 - 處理錯誤
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
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
      const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
      });
      
      // 登入成功後保存 token 和用戶信息
      if (response.status == 200) {
        const userData = {
          id: response.data.user_id,
          nickname: response.data.nickname,
          role: response.data.role,
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // 觸發登入成功事件，通知 AuthContext 更新狀態
        window.dispatchEvent(new CustomEvent('auth-login-success', {
          detail: userData
        }));
      }
      
      return {
        success: true,
        data: response.data,
        message: i18n.t('auth.api.login_success')
      };
    } catch (error) {
      return this.handleError(error, i18n.t('auth.api.login_fail'));
    }
  }

  /**
   * 用戶註冊
   * @param {Object} userData - 註冊資料
   * @param {string} userData.nickname - 暱稱
   * @param {string} userData.email - 電子郵件
   * @param {string} userData.password - 密碼
   * @param {string} userData.confirmPassword - 確認密碼
   * @returns {Promise} API 響應
   */
  async register(userData) {
    if (userData.password !== userData.confirmPassword) {
      return this.handleError({}, i18n.t('auth.api.confirm_password_wrong'))
    }
    try {
      const response = await apiClient.post(apiConfig.ENDPOINTS.AUTH.REGISTER, {
        nickname: userData.nickname,
        email: userData.email,
        password: userData.password,
      });
      
      // 註冊成功後可以自動登入或要求用戶登入
      if (response.status == 200) {
        // 自動登入用戶
        const loginResult = await this.login({
          email: userData.email,
          password: userData.password
        });
        
        if (loginResult.success) {
          return {
            success: true,
            data: response.data,
            message: i18n.t('auth.api.register_success')
          };
        }
      }
      
      return {
        success: true,
        data: response.data,
        message: i18n.t('auth.api.register_success')
      };
    } catch (error) {
      return this.handleError(error, i18n.t('auth.api.register_fail'));
    }
  }

  /**
   * 獲取當前用戶信息
   * @returns {Object|null} 用戶信息
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * 檢查用戶是否已登入
   * @returns {boolean} 是否已登入
   */
  isAuthenticated() {
    const user = this.getCurrentUser();
    return user !== null && user !== undefined;
  }

  /**
   * 登出
   * @returns {Promise} 登出結果
   */
  async logout() {
    try {
      // 調用後端登出 API 來清除 httpOnly cookie
      await apiClient.post(apiConfig.ENDPOINTS.AUTH.LOGOUT, {}, {
        withCredentials: true // 確保發送 cookies
      });
      
      // 清除本地存儲的用戶信息
      localStorage.removeItem('user');
      
      // 觸發登出事件
      window.dispatchEvent(new CustomEvent('auth-logout'));
      
      return {
        success: true,
        message: i18n.t('auth.api.logout_success')
      };
    } catch (error) {
      // 即使後端 API 調用失敗，也要清除本地狀態
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth-logout'));
      
      console.warn('Logout API failed, but local state cleared:', error);
      
      return {
        success: true, // 仍然返回成功，因為本地狀態已清除
        message: i18n.t('auth.api.logout_success'),
        warning: 'Backend logout failed, but local logout completed'
      };
    }
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
      message = i18n.t('auth.api.network_error');
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

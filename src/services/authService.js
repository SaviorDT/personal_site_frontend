import apiClient, { handleApiError } from './apiClient';
import apiConfig from '@/config/api';
import i18n from 'i18next';

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
      return handleApiError(error, i18n.t('auth.api.login_fail'));
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
      return handleApiError({}, i18n.t('auth.api.confirm_password_wrong'))
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
      return handleApiError(error, i18n.t('auth.api.register_fail'));
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
}

// 創建並導出單例
const authService = new AuthService();
export default authService;

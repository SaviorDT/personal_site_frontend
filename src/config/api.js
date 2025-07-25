// API 配置
const apiConfig = {
  // 根據環境變數決定 API 基礎 URL
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  
  // 請求超時時間 (毫秒)
  TIMEOUT: 10000,
  
  // API 版本
  API_VERSION: 'v1',
  
  // 端點定義
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_EMAIL: '/auth/verify-email',
      SOCIAL_LOGIN: '/auth/social',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE_PROFILE: '/user/profile',
      CHANGE_PASSWORD: '/user/change-password',
      DELETE_ACCOUNT: '/user/delete',
    },
  },
  
  // 社交登入提供者
  SOCIAL_PROVIDERS: {
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    GITHUB: 'github',
    LINE: 'line',
  },
  
  // HTTP 狀態碼
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
};

export default apiConfig;

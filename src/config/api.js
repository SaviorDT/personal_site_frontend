// API 配置
const apiConfig = {
  // 根據環境變數決定 API 基礎 URL
  API_BASE_URL: import.meta.env.VITE_API_URL,

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
      CHANGE_PASSWORD: '/auth/change-password',
      GITHUB_OAUTH: '/auth/login-github',
      GOOGLE_OAUTH: '/auth/login-google',
    },
    FILE_SYSTEM: {
      FOLDERS: {
        // GET    LIST   ?path=<folderPath>
        LIST: '/storage/folder',
        // POST   CREATE body: { path, name }
        CREATE: '/storage/folder',
        // PATCH  RENAME body: { path, oldName, newName }
        RENAME: '/storage/folder',
        // DELETE DELETE params: { path, name }
        DELETE: '/storage/folder',
      },
      FILES: {
        // POST   UPLOAD multipart/form-data: { path, file }
        UPLOAD: '/storage/file',
        // PATCH  RENAME body: { path, oldName, newName }
        RENAME: '/storage/file',
        // DELETE DELETE params: { path, name }
        DELETE: '/storage/file',
        // GET    DOWNLOAD ?path=&name=  responseType: blob
        DOWNLOAD: '/storage/file',
      }
    },
  },

  // 社交登入提供者
  SOCIAL_PROVIDERS: {
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    GITHUB: 'github',
    LINE: 'line',
  },
};

export default apiConfig;

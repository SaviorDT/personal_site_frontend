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
    // 戰貓（Battle Cat）相關端點
    BATTLE_CAT: {
      // 依章節與敵人組合查詢關卡
      FIND_LEVEL: '/battle-cat/levels',
    },
    FILE_SYSTEM: {
      FOLDERS: {
        // GET    /storage/folder/*folder_path   列出目錄內容（無此路徑時回 200 + {}）
        LIST: '/storage/folder',
        // POST   /storage/folder/*folder_path   建立資料夾，無 request body
        CREATE: '/storage/folder',
        // PATCH  /storage/folder/*folder_path   body: { path: 新路徑 }（rename/move 共用）
        RENAME: '/storage/folder',
        // DELETE /storage/folder/*folder_path   遞迴刪除資料夾與其內容
        DELETE: '/storage/folder',
      },
      FILES: {
        // 可續傳上傳（session-based，見 fileService.js 的 runResumableUpload）：
        // POST /storage/file/*file_path  body: { size } → { session_id }
        // PUT  /storage/file/*file_path?session_id=&offset=  body: raw binary
        UPLOAD: '/storage/file',
        // PATCH  /storage/file/*file_path   body: { path: 新路徑 }（rename/move 共用）
        RENAME: '/storage/file',
        // DELETE /storage/file/*file_path   刪除已完成的檔案；帶 ?session_id= 則改為取消進行中的上傳
        DELETE: '/storage/file',
        // GET    /storage/file/*file_path   下載/串流；responseType: blob
        DOWNLOAD: '/storage/file',
      }
    },
    // 短網址管理相關端點
    URL_SHORTENER: {
      // GET    LIST    列出所有短網址
      // POST   CREATE  創建新短網址 body: { key?, target_url, expires_in? }
      LIST: '/reurl',
      CREATE: '/reurl',
      // GET    DETAIL  獲取單個短網址詳情
      // PATCH  UPDATE  更新短網址 body: { key?, target_url?, expires_in? }
      // DELETE DELETE  刪除短網址
      DETAIL: '/reurl/{id}',
      // GET    REDIRECT 重定向短網址（返回 302 或 404）
      REDIRECT: '/reurl/redirect/{path}',
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

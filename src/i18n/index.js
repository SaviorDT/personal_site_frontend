import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 語言資源
const resources = {
  zh: {
    translation: {
      // 導航
      nav: {
        home: "首頁",
        about: "自我介紹",
        articles: "文章",
        portfolio: "作品集",
        contact: "聯絡",
        login: "登入",
        register: "註冊",
        account: "登入",
        logout: "登出"
      },
      // 英雄區塊
      hero: {
        greeting: "Hello, 我是",
        name: "蔡東霖",
        roles: {
          web: "寫網頁",
          tools: "寫小工具",
          images: "影像辨識",
          news: "嘗試新事物"
        },
        staticText: "擅長",
        description: "熱衷於用程式解決生活中的問題，喜歡製作一些實用的工具，不拘泥於程式語言，從購物網站到遊戲外掛都駕輕就熟。",
        buttons: {
          knowMe: "認識我",
          viewWork: "查看作品"
        },
        scrollText: "往下滑動探索更多"
      },
      // 預覽區塊
      preview: {
        title: "探索更多內容",
        subtitle: "深入了解我的專業技能、創作內容和精彩作品",
        sections: {
          about: {
            title: "關於我",
            description: "了解我的背景、技能和經歷",
            features: ["個人簡介", "技術技能", "工作經歷", "教育背景"]
          },
          articles: {
            title: "文章分享",
            description: "分享程式心得以及日常生活",
            features: ["資工科普", "議題反思", "動漫評論", "生活隨筆"]
          },
          portfolio: {
            title: "作品集",
            description: "展示我的專案作品與開發成果",
            features: ["網頁專案", "線上工具", "遊戲助手"]
          }
        },
        viewMore: "查看更多",
        contact: {
          title: "讓我們開始對話",
          description: "有任何想法或合作機會？歡迎與我聯繫！",
          email: "tony200404242@gmail.com"
        }
      },
      // 認證
      auth: {
        fields: {
          nickname: "暱稱",
          email: "電子信箱",
          password: "密碼",
          confirmPassword: "確認密碼"
        },
        placeholders: {
          nickname: "請輸入您的暱稱",
          email: "請輸入電子信箱",
          password: "請輸入密碼（可輸入中文）",
          confirmPassword: "請再次輸入密碼"
        },
        login: {
          title: "歡迎回來",
          subtitle: "登入您的帳戶繼續使用",
          submit: "登入",
          submitting: "登入中...",
          switchText: "還沒有帳戶？",
          switchAction: "立即註冊"
        },
        register: {
          title: "加入我們",
          subtitle: "創建您的帳戶開始體驗",
          submit: "註冊",
          submitting: "註冊中...",
          switchText: "已經有帳戶了？",
          switchAction: "立即登入"
        },
        success: {
          default: "操作成功"
        },
        error: {
          default: "操作失敗，請稍後再試",
          network: "網絡連接錯誤，請檢查您的網絡連接",
          social_not_implemented: "第三方平台登入功能尚未實現",
          popup_blocked: "無法開啟登入視窗，請允許彈出視窗"
        },
        or: "或",
        social: {
          google: "Google",
          facebook: "Facebook",
          github: "GitHub",
          line: "LINE"
        },
        api: {
          login_success: "登入成功",
          login_fail: "登入失敗",
          confirm_password_wrong: "兩次輸入密碼不一致",
          register_success: "註冊成功",
          register_fail: "註冊失敗",
          logout_success: "登出成功",
          network_error: "網絡連接錯誤，請檢查您的網絡連接"
        }
      },
      // 文章相關翻譯
      articles: {
        title: "文章分享",
        subtitle: "分享程式心得以及日常生活",
        type: {
          frontend: "本站原創",
          backend: "精選文章"
        },
        readTime: "分鐘閱讀",
        readMore: "閱讀更多",
        search: {
          placeholder: "搜尋文章..."
        },
        filter: {
          category: "類別",
          tags: "標籤",
          all: "全部",
          clear: "清除篩選"
        },
        loading: "載入中...",
        found: "找到 {{count}} 篇文章",
        retry: "重試",
        empty: {
          title: "暫無文章",
          message: "目前沒有符合條件的文章，請嘗試調整篩選條件。"
        }
      },
      // 分頁翻譯
      pagination: {
        prev: "上一頁",
        next: "下一頁"
      },
      // 短網址重定向
      redirect: {
        checking: {
          title: "檢查中...",
          message: "正在驗證短網址，請稍候"
        },
        redirecting: {
          title: "重定向中",
          message: "即將跳轉到目標頁面..."
        },
        notFound: {
          title: "404 - 頁面未找到",
          message: "抱歉，您訪問的頁面不存在或短網址已過期",
          backHome: "返回首頁"
        },
        error: {
          noTarget: "短網址配置錯誤，無法獲取目標網址",
          network: "網絡連接錯誤，請檢查您的網絡"
        }
      },
      // 簡易儲存倉庫（FileSystem 元件）
      fileSystem: {
        guestNotice: "目前以訪客身分使用共用儲存空間，所有未登入的使用者共用同一份檔案，且管理員可以看到這裡的所有內容——請不要上傳不想被看到的東西。",
        breadcrumb: {
          root: "根目錄"
        },
        actions: {
          goRoot: "回到根目錄",
          goUp: "上一層",
          upload: "上傳",
          uploadFilesTitle: "上傳檔案",
          uploadFolder: "上傳資料夾",
          refresh: "重新整理"
        },
        toolbar: {
          newFolderPlaceholder: "新資料夾名稱",
          createFolder: "新增資料夾",
          newFilePlaceholder: "新檔案名稱（例如 notes.txt）",
          createFile: "新增檔案"
        },
        validation: {
          invalidFileName: "檔名不可包含 / 或 \\"
        },
        confirm: {
          deleteEntry: "確定要刪除「{{name}}」嗎？",
          renamePrompt: "重新命名為：",
          movePrompt: "移動到目標資料夾路徑（例如 / 或 /相簿/日本）",
          cannotMoveIntoSelf: "不可將資料夾移動到自己或其子路徑"
        },
        list: {
          loading: "讀取中…",
          empty: "這裡還沒有檔案或資料夾"
        },
        download: {
          previewLoading: "下載預覽…"
        },
        upload: {
          summary: "上傳進度：{{done}} / {{total}} 個檔案（{{doneBytes}} / {{totalBytes}}）",
          collapse: "收合",
          expand: "展開",
          cancelAll: "全部取消",
          retryAll: "全部重試",
          clearCompleted: "清除已完成",
          cancel: "取消",
          retry: "重試",
          dismiss: "移除此列",
          status: {
            queued: "等待中",
            uploading: "上傳中",
            success: "完成",
            failed: "失敗",
            cancelled: "已取消"
          }
        },
        preview: {
          titleNew: "新增檔案（尚未儲存）：",
          titleExisting: "預覽：",
          close: "關閉",
          download: "下載",
          pdfFallback: "PDF 無法預覽，請下載",
          saving: "儲存中…",
          save: "儲存",
          unsupported: "無法預覽此檔案，請下載查看。"
        },
        item: {
          preview: "預覽",
          download: "下載",
          rename: "重新命名",
          move: "移動",
          delete: "刪除",
          open: "開啟",
          share: "分享",
          folderLabel: "資料夾"
        },
        share: {
          title: "分享檔案",
          expiresLabel: "期限",
          duration: {
            "1h": "1 小時",
            "12h": "12 小時",
            "1d": "1 天",
            "7d": "7 天",
            "30d": "30 天",
            "365d": "365 天"
          },
          shortenLabel: "縮短網址",
          loginRequired: "登入後才能縮短網址",
          generate: "產生連結",
          generating: "產生中…",
          copy: "複製",
          copySuccess: "已複製到剪貼簿！",
          copyFailed: "複製失敗，請手動複製",
          shortenFailedFallback: "縮短網址失敗，已改用原始連結"
        },
        errors: {
          listDirectory: "無法取得目錄內容",
          createFolder: "建立資料夾失敗",
          renameFolder: "重新命名資料夾失敗",
          deleteFolder: "刪除資料夾失敗",
          createSession: "無法建立上傳工作階段",
          createEmptyFile: "建立空檔案失敗",
          createShare: "建立分享連結失敗",
          uploadRetryExhausted: "檔案上傳失敗，已達重試上限",
          cancelUpload: "取消上傳失敗",
          renameFile: "重新命名檔案失敗",
          deleteFile: "刪除檔案失敗",
          getFile: "無法取得檔案",
          notTextFile: "非文字檔案",
          moveFile: "移動檔案失敗",
          moveFolder: "移動資料夾失敗",
          locked: "此檔案正在上傳中，請稍後再試",
          conflict: "這段內容與已寫入的資料重疊，請重新整理後再試",
          staleSession: "上傳工作階段已過期或不正確，請重新開始上傳"
        }
      }
    }
  },
  en: {
    translation: {
      // Navigation
      nav: {
        home: "Home",
        about: "About",
        articles: "Articles",
        portfolio: "Portfolio",
        contact: "Contact",
        login: "Login",
        register: "Register",
        account: "Login",
        logout: "Logout"
      },
      // Hero Section
      hero: {
        greeting: "Hello, I'm",
        name: "Tony",
        roles: {
          web: "writing web",
          tools: "making tools",
          images: "image recognition",
          news: "trying new things"
        },
        staticText: "be good at",
        description: "Passionate about solving everyday problems with code, I enjoy creating practical tools and am not limited to any specific programming language, from shopping websites to game plugins.",
        buttons: {
          knowMe: "Know Me",
          viewWork: "View Work"
        },
        scrollText: "Scroll down to explore more"
      },
      // Preview Sections
      preview: {
        title: "Explore More Content",
        subtitle: "Dive deep into my professional skills, creative content, and amazing works",
        sections: {
          about: {
            title: "About Me",
            description: "Learn about my background, skills, and experience",
            features: ["Personal Profile", "Technical Skills", "Work Experience", "Education"]
          },
          articles: {
            title: "Articles sharing",
            description: "Share programing insights and daily life",
            features: ["Computer Science Popularization", "Topic Reflection", "Anime Reviews", "Life Essays"]
          },
          portfolio: {
            title: "Portfolio",
            description: "Showcase my project works and development achievements",
            features: ["Web Applications", "Online Tools", "Game Assistants"]
          }
        },
        viewMore: "View More",
        contact: {
          title: "Let's Start a Conversation",
          description: "Have any ideas or collaboration opportunities? Feel free to contact me!",
          email: "tony200404242@gmail.com"
        }
      },
      // Authentication
      auth: {
        fields: {
          nickname: "Nickname",
          email: "Email",
          password: "Password",
          confirmPassword: "Confirm Password"
        },
        placeholders: {
          nickname: "Enter your nickname",
          email: "Enter your email address",
          password: "Enter your password",
          confirmPassword: "Confirm your password"
        },
        login: {
          title: "Welcome Back",
          subtitle: "Sign in to your account to continue",
          submit: "Sign In",
          submitting: "Signing in...",
          switchText: "Don't have an account?",
          switchAction: "Sign up now"
        },
        register: {
          title: "Join Us",
          subtitle: "Create your account to get started",
          submit: "Sign Up",
          submitting: "Signing up...",
          switchText: "Already have an account?",
          switchAction: "Sign in now"
        },
        success: {
          default: "Operation successful"
        },
        error: {
          default: "Operation failed, please try again",
          network: "Network connection error, please check your network",
          social_not_implemented: "3rd party platform login feature is not implemented yet",
          popup_blocked: "Cannot open login window. Please enable popup window."
        },
        or: "or",
        social: {
          google: "Google",
          facebook: "Facebook",
          github: "GitHub",
          line: "LINE"
        },
        api: {
          login_success: "login successed!",
          login_fail: "login failed!",
          confirm_password_wrong: "confirm password not same as password!",
          register_success: "register successed!",
          register_fail: "register failed!",
          logout_success: "logout successed!",
          network_error: "connecting error. Please check your network!"
        }
      },
      // 文章相關翻譯
      articles: {
        title: "Articles sharing",
        subtitle: "Share programing insights and daily life",
        type: {
          frontend: "本站原創",
          backend: "精選文章"
        },
        readTime: "minutes read",
        readMore: "Read More",
        search: {
          placeholder: "Search articles..."
        },
        filter: {
          category: "Category",
          tags: "Tags",
          all: "All",
          clear: "Clear Filter"
        },
        loading: "Loading...",
        found: "Found {{count}} articles",
        retry: "Retry",
        empty: {
          title: "No Articles",
          message: "There are currently no articles that match your criteria. Please try adjusting your filters."
        }
      },
      // 分頁翻譯
      pagination: {
        prev: "Previous",
        next: "Next"
      },
      // URL Redirect
      redirect: {
        checking: {
          title: "Checking...",
          message: "Verifying short URL, please wait"
        },
        redirecting: {
          title: "Redirecting",
          message: "Redirecting to target page..."
        },
        notFound: {
          title: "404 - Page Not Found",
          message: "Sorry, the page you're looking for doesn't exist or the short URL has expired",
          backHome: "Back to Home"
        },
        error: {
          noTarget: "Short URL configuration error, unable to get target URL",
          network: "Network connection error, please check your network"
        }
      },
      // Simple Storage Vault (FileSystem component)
      fileSystem: {
        guestNotice: "You're using the shared guest storage — everyone who isn't logged in shares the same files, and admins can see everything here. Please don't upload anything you don't want seen.",
        breadcrumb: {
          root: "Root"
        },
        actions: {
          goRoot: "Go to root",
          goUp: "Up one level",
          upload: "Upload",
          uploadFilesTitle: "Upload files",
          uploadFolder: "Upload folder",
          refresh: "Refresh"
        },
        toolbar: {
          newFolderPlaceholder: "New folder name",
          createFolder: "New folder",
          newFilePlaceholder: "New file name (e.g. notes.txt)",
          createFile: "New file"
        },
        validation: {
          invalidFileName: "File name cannot contain / or \\"
        },
        confirm: {
          deleteEntry: "Are you sure you want to delete \"{{name}}\"?",
          renamePrompt: "Rename to:",
          movePrompt: "Move to target folder path (e.g. / or /Albums/Japan)",
          cannotMoveIntoSelf: "A folder cannot be moved into itself or its own subfolder"
        },
        list: {
          loading: "Loading…",
          empty: "No files or folders here yet"
        },
        download: {
          previewLoading: "Downloading preview…"
        },
        upload: {
          summary: "Upload progress: {{done}} / {{total}} files ({{doneBytes}} / {{totalBytes}})",
          collapse: "Collapse",
          expand: "Expand",
          cancelAll: "Cancel all",
          retryAll: "Retry all",
          clearCompleted: "Clear completed",
          cancel: "Cancel",
          retry: "Retry",
          dismiss: "Remove this row",
          status: {
            queued: "Waiting",
            uploading: "Uploading",
            success: "Done",
            failed: "Failed",
            cancelled: "Cancelled"
          }
        },
        preview: {
          titleNew: "New file (not saved yet): ",
          titleExisting: "Preview: ",
          close: "Close",
          download: "Download",
          pdfFallback: "Can't preview this PDF, please download it",
          saving: "Saving…",
          save: "Save",
          unsupported: "Can't preview this file, please download it to view."
        },
        item: {
          preview: "Preview",
          download: "Download",
          rename: "Rename",
          move: "Move",
          delete: "Delete",
          open: "Open",
          share: "Share",
          folderLabel: "Folder"
        },
        share: {
          title: "Share file",
          expiresLabel: "Expires in",
          duration: {
            "1h": "1 hour",
            "12h": "12 hours",
            "1d": "1 day",
            "7d": "7 days",
            "30d": "30 days",
            "365d": "365 days"
          },
          shortenLabel: "Shorten the URL",
          loginRequired: "Log in to shorten the URL",
          generate: "Generate link",
          generating: "Generating…",
          copy: "Copy",
          copySuccess: "Copied to clipboard!",
          copyFailed: "Copy failed, please copy it manually",
          shortenFailedFallback: "Failed to shorten the URL, using the original link instead"
        },
        errors: {
          listDirectory: "Failed to load directory contents",
          createFolder: "Failed to create folder",
          renameFolder: "Failed to rename folder",
          deleteFolder: "Failed to delete folder",
          createSession: "Failed to start an upload session",
          createEmptyFile: "Failed to create empty file",
          createShare: "Failed to create share link",
          uploadRetryExhausted: "File upload failed, retry limit reached",
          cancelUpload: "Failed to cancel upload",
          renameFile: "Failed to rename file",
          deleteFile: "Failed to delete file",
          getFile: "Failed to load file",
          notTextFile: "Not a text file",
          moveFile: "Failed to move file",
          moveFolder: "Failed to move folder",
          locked: "This file is currently being uploaded, please try again later",
          conflict: "This range overlaps data that was already written, please refresh and try again",
          staleSession: "The upload session has expired or is invalid, please start the upload again"
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React 已經做了 XSS 保護
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;

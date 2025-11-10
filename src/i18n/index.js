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
        prev: "上一頁",
        next: "下一頁"
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

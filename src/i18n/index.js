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
        contact: "聯絡"
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
        contact: "Contact"
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
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React 已經做了 XSS 保護
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;

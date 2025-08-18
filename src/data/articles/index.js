// 文章系統統一導出文件

// 導出文章數據和工具函數
export {
  frontendArticles,
  loadArticleComponent,
  getArticleMetadata,
  getArticlesByCategory,
  getArticleCategories,
  getArticlesByTag,
  searchArticles
} from './frontendArticles.js';

// 導出個別文章的 metadata
export { metadata as reactViteGuideMetadata } from './react-vite-guide/ReactViteGuide.jsx';

// 文章類型定義（用於 TypeScript 或文檔參考）
export const ARTICLE_TYPES = {
  FRONTEND: 'frontend',
  BACKEND: 'backend'
};

export const ARTICLE_CATEGORIES = {
  TECH_SHARING: '技術分享',
  LIFE_ESSAY: '生活隨筆',
  ANIME_REVIEW: '動漫評論',
  TUTORIAL: '教學指南',
  EXPERIENCE: '經驗分享'
};

export const ARTICLE_DIFFICULTIES = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// 文章 metadata 結構範例（用於參考）
export const ARTICLE_METADATA_SCHEMA = {
  id: 'string', // 文章唯一識別碼
  type: 'string', // 'frontend' 或 'backend'
  title: 'string', // 文章標題
  thumbnail: 'string', // 縮圖路徑
  excerpt: 'string', // 文章摘要
  author: 'string', // 作者
  publishDate: 'string', // 發布日期 (YYYY-MM-DD)
  tags: 'array', // 標籤陣列
  category: 'string', // 分類
  readTime: 'number', // 預估閱讀時間（分鐘）
  featured: 'boolean', // 是否為精選文章（可選）
  difficulty: 'string', // 難度等級（可選）
  lastModified: 'string' // 最後修改日期（可選）
};

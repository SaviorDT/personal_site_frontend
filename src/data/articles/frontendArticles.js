// 文章 metadata 儲存
// 每篇文章都有對應的 JSX 組件在 @/data/articles/{article-name}/ 資料夾內

// 動態導入文章組件和 metadata
import { metadata as reactViteGuideMetadata } from './react-vite-guide/ReactViteGuide.jsx';

// 文章 metadata 陣列
export const frontendArticles = [
  reactViteGuideMetadata,
  // 新增文章時，在此處加入對應的 metadata
];

// 動態載入文章組件的函數
export const loadArticleComponent = async (articleId) => {
  try {
    switch (articleId) {
      case 'react-vite-guide':
        const { default: ReactViteGuide } = await import('./react-vite-guide/ReactViteGuide.jsx');
        return ReactViteGuide;
      
      // 新增文章時，在此處加入對應的動態導入
      
      default:
        throw new Error(`Article component not found: ${articleId}`);
    }
  } catch (error) {
    console.error('Failed to load article component:', error);
    return null;
  }
};

// 獲取文章 metadata
export const getArticleMetadata = (articleId) => {
  return frontendArticles.find(article => article.id === articleId);
};

// 根據類別分組文章
export const getArticlesByCategory = (category) => {
  if (!category) return frontendArticles;
  return frontendArticles.filter(article => article.category === category);
};

// 獲取所有類別
export const getArticleCategories = () => {
  const categories = [...new Set(frontendArticles.map(article => article.category))];
  return categories;
};

// 根據標籤獲取文章
export const getArticlesByTag = (tag) => {
  return frontendArticles.filter(article => 
    article.tags.some(articleTag => 
      articleTag.toLowerCase().includes(tag.toLowerCase())
    )
  );
};

// 搜尋文章
export const searchArticles = (keyword) => {
  const lowerKeyword = keyword.toLowerCase();
  return frontendArticles.filter(article => 
    article.title.toLowerCase().includes(lowerKeyword) ||
    article.excerpt.toLowerCase().includes(lowerKeyword) ||
    article.content.toLowerCase().includes(lowerKeyword) ||
    article.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
};

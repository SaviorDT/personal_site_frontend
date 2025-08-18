import { frontendArticles, getArticlesByCategory, getArticlesByTag, searchArticles as searchFrontendArticles } from '@/data/articles/frontendArticles';
import backendArticleService from './backendArticleService';

// 統一文章服務，整合前端和後端文章
class ArticleService {
  
  /**
   * 獲取所有文章（前端 + 後端）
   * @param {Object} options - 選項
   * @param {string} options.category - 類別篩選
   * @param {string} options.tag - 標籤篩選
   * @param {string} options.search - 搜尋關鍵字
   * @param {number} options.page - 頁數
   * @param {number} options.limit - 每頁數量
   * @returns {Promise<Object>} 文章列表和分頁資訊
   */
  async getAllArticles(options = {}) {
    try {
      // 獲取前端文章
      let frontendResults = [...frontendArticles];
      
      // 根據選項篩選前端文章
      if (options.category) {
        frontendResults = getArticlesByCategory(options.category);
      }
      
      if (options.tag) {
        frontendResults = getArticlesByTag(options.tag);
      }
      
      if (options.search) {
        frontendResults = searchFrontendArticles(options.search);
      }

      // 獲取後端文章
      const backendResults = await backendArticleService.getArticles({
        page: options.page,
        limit: options.limit,
        category: options.category,
        tag: options.tag,
        search: options.search
      });

      // 合併結果
      const allArticles = [
        ...frontendResults,
        ...backendResults.articles
      ];

      // 按發布日期排序（最新的在前）
      allArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

      // 實現分頁
      const page = options.page || 1;
      const limit = options.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedArticles = allArticles.slice(startIndex, endIndex);

      return {
        articles: paginatedArticles,
        pagination: {
          current: page,
          total: allArticles.length,
          pageSize: limit,
          totalPages: Math.ceil(allArticles.length / limit)
        }
      };
    } catch (error) {
      console.error('獲取文章列表失敗:', error);
      throw new Error('無法獲取文章列表');
    }
  }

  /**
   * 根據 ID 獲取單篇文章
   * @param {string} id - 文章 ID
   * @returns {Promise<Object|null>} 文章詳情
   */
  async getArticleById(id) {
    try {
      // 先在前端文章中查找
      const frontendArticle = frontendArticles.find(article => article.id === id);
      if (frontendArticle) {
        return frontendArticle;
      }

      // 如果前端沒有，則查找後端文章
      const backendArticle = await backendArticleService.getArticleById(id);
      if (backendArticle) {
        // 增加瀏覽次數（僅後端文章）
        await backendArticleService.incrementViewCount(id);
      }
      
      return backendArticle;
    } catch (error) {
      console.error('獲取文章詳情失敗:', error);
      throw new Error('無法獲取文章詳情');
    }
  }

  /**
   * 獲取所有文章類別
   * @returns {Promise<Array>} 類別列表
   */
  async getAllCategories() {
    try {
      // 獲取前端文章類別
      const frontendCategories = [...new Set(frontendArticles.map(article => article.category))];
      
      // 獲取後端文章類別
      const backendCategories = await backendArticleService.getCategories();
      
      // 合併並去重
      const allCategories = [...new Set([...frontendCategories, ...backendCategories])];
      
      return allCategories;
    } catch (error) {
      console.error('獲取文章類別失敗:', error);
      throw new Error('無法獲取文章類別');
    }
  }

  /**
   * 獲取熱門標籤
   * @param {number} limit - 返回數量限制
   * @returns {Promise<Array>} 標籤列表
   */
  async getPopularTags(limit = 20) {
    try {
      // 統計前端文章標籤
      const frontendTagCount = {};
      frontendArticles.forEach(article => {
        article.tags.forEach(tag => {
          frontendTagCount[tag] = (frontendTagCount[tag] || 0) + 1;
        });
      });

      // 獲取後端熱門標籤
      const backendTags = await backendArticleService.getPopularTags(limit);
      
      // 合併標籤計數
      const allTags = { ...frontendTagCount };
      backendTags.forEach(tag => {
        if (typeof tag === 'object' && tag.name && tag.count) {
          allTags[tag.name] = (allTags[tag.name] || 0) + tag.count;
        } else if (typeof tag === 'string') {
          allTags[tag] = (allTags[tag] || 0) + 1;
        }
      });

      // 按使用次數排序並限制數量
      const sortedTags = Object.entries(allTags)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }));

      return sortedTags;
    } catch (error) {
      console.error('獲取熱門標籤失敗:', error);
      throw new Error('無法獲取熱門標籤');
    }
  }

  /**
   * 搜尋文章
   * @param {string} keyword - 搜尋關鍵字
   * @param {Object} filters - 篩選條件
   * @returns {Promise<Object>} 搜尋結果
   */
  async searchArticles(keyword, filters = {}) {
    try {
      if (!keyword.trim()) {
        return { articles: [], total: 0 };
      }

      // 搜尋前端文章
      const frontendResults = searchFrontendArticles(keyword);
      
      // 搜尋後端文章
      const backendResults = await backendArticleService.searchArticles(keyword, filters);
      
      // 合併結果
      const allResults = [
        ...frontendResults,
        ...backendResults.articles
      ];

      // 按相關性和日期排序
      allResults.sort((a, b) => {
        // 簡單的相關性計算：標題匹配優先
        const aInTitle = a.title.toLowerCase().includes(keyword.toLowerCase());
        const bInTitle = b.title.toLowerCase().includes(keyword.toLowerCase());
        
        if (aInTitle && !bInTitle) return -1;
        if (!aInTitle && bInTitle) return 1;
        
        // 如果相關性相同，按日期排序
        return new Date(b.publishDate) - new Date(a.publishDate);
      });

      return {
        articles: allResults,
        total: allResults.length
      };
    } catch (error) {
      console.error('搜尋文章失敗:', error);
      throw new Error('搜尋失敗');
    }
  }

  /**
   * 獲取相關文章
   * @param {Object} currentArticle - 當前文章
   * @param {number} limit - 返回數量限制
   * @returns {Promise<Array>} 相關文章列表
   */
  async getRelatedArticles(currentArticle, limit = 3) {
    try {
      // 獲取所有文章
      const allArticlesResult = await this.getAllArticles();
      const allArticles = allArticlesResult.articles;
      
      // 排除當前文章
      const otherArticles = allArticles.filter(article => article.id !== currentArticle.id);
      
      // 計算相關性（基於標籤和類別）
      const relatedArticles = otherArticles.map(article => {
        let score = 0;
        
        // 相同類別加分
        if (article.category === currentArticle.category) {
          score += 3;
        }
        
        // 相同標籤加分
        const commonTags = article.tags.filter(tag => 
          currentArticle.tags.includes(tag)
        );
        score += commonTags.length * 2;
        
        return { ...article, relevanceScore: score };
      });
      
      // 按相關性排序並限制數量
      return relatedArticles
        .filter(article => article.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error('獲取相關文章失敗:', error);
      return [];
    }
  }
}

// 創建服務實例
const articleService = new ArticleService();

export default articleService;

import api from '@/config/api';

// 後端文章服務 - 目前先定義介面，實際實現待後端完成
class BackendArticleService {
  
  /**
   * 獲取所有後端文章
   * @param {Object} params - 查詢參數
   * @param {number} params.page - 頁數 (預設: 1)
   * @param {number} params.limit - 每頁數量 (預設: 10)
   * @param {string} params.category - 類別篩選
   * @param {string} params.tag - 標籤篩選
   * @param {string} params.search - 搜尋關鍵字
   * @returns {Promise<Object>} 文章列表和分頁資訊
   */
  async getArticles(params = {}) {
    try {
      // TODO: 實現後端 API 調用
      console.log('呼叫後端 API 獲取文章:', params);
      
      // 暫時返回空結果
      return {
        articles: [],
        pagination: {
          current: params.page || 1,
          total: 0,
          pageSize: params.limit || 10,
          totalPages: 0
        }
      };
      
      // 未來的實際實現：
      // const response = await api.get('/articles', { params });
      // return response.data;
    } catch (error) {
      console.error('獲取後端文章失敗:', error);
      throw new Error('無法獲取文章列表');
    }
  }

  /**
   * 根據 ID 獲取單篇文章
   * @param {string} id - 文章 ID
   * @returns {Promise<Object>} 文章詳情
   */
  async getArticleById(id) {
    try {
      // TODO: 實現後端 API 調用
      console.log('呼叫後端 API 獲取文章詳情:', id);
      
      // 暫時返回空結果
      return null;
      
      // 未來的實際實現：
      // const response = await api.get(`/articles/${id}`);
      // return response.data;
    } catch (error) {
      console.error('獲取文章詳情失敗:', error);
      throw new Error('無法獲取文章詳情');
    }
  }

  /**
   * 獲取文章類別列表
   * @returns {Promise<Array>} 類別列表
   */
  async getCategories() {
    try {
      // TODO: 實現後端 API 調用
      console.log('呼叫後端 API 獲取文章類別');
      
      // 暫時返回空結果
      return [];
      
      // 未來的實際實現：
      // const response = await api.get('/articles/categories');
      // return response.data;
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
      // TODO: 實現後端 API 調用
      console.log('呼叫後端 API 獲取熱門標籤:', { limit });
      
      // 暫時返回空結果
      return [];
      
      // 未來的實際實現：
      // const response = await api.get('/articles/tags/popular', { 
      //   params: { limit } 
      // });
      // return response.data;
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
      // TODO: 實現後端 API 調用
      console.log('呼叫後端 API 搜尋文章:', { keyword, filters });
      
      // 暫時返回空結果
      return {
        articles: [],
        total: 0
      };
      
      // 未來的實際實現：
      // const response = await api.post('/articles/search', {
      //   keyword,
      //   ...filters
      // });
      // return response.data;
    } catch (error) {
      console.error('搜尋文章失敗:', error);
      throw new Error('搜尋失敗');
    }
  }

  /**
   * 文章瀏覽次數計數
   * @param {string} id - 文章 ID
   * @returns {Promise<void>}
   */
  async incrementViewCount(id) {
    try {
      // TODO: 實現後端 API 調用
      console.log('呼叫後端 API 增加瀏覽次數:', id);
      
      // 未來的實際實現：
      // await api.post(`/articles/${id}/view`);
    } catch (error) {
      console.error('增加瀏覽次數失敗:', error);
      // 這個錯誤可以靜默處理，不影響用戶體驗
    }
  }
}

// 創建服務實例
const backendArticleService = new BackendArticleService();

export default backendArticleService;

// 導出常用方法以便直接使用
export const {
  getArticles,
  getArticleById,
  getCategories,
  getPopularTags,
  searchArticles,
  incrementViewCount
} = backendArticleService;

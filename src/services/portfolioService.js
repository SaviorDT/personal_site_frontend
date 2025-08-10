import { portfolioProjects, getProjectsByCategory, getProjectsByTag, searchProjects as searchPortfolioProjects, getFeaturedProjects as getPortfolioFeaturedProjects } from '@/data/portfolio';

// 作品集服務，管理所有項目數據
class PortfolioService {
  
  /**
   * 獲取所有項目
   * @param {Object} options - 選項
   * @param {string} options.category - 類別篩選
   * @param {string} options.tag - 標籤篩選
   * @param {string} options.search - 搜尋關鍵字
   * @param {number} options.page - 頁數
   * @param {number} options.limit - 每頁數量
   * @returns {Promise<Object>} 項目列表和分頁資訊
   */
  async getAllProjects(options = {}) {
    try {
      // 獲取所有項目
      let results = [...portfolioProjects];
      
      // 根據選項篩選項目
      if (options.category) {
        results = getProjectsByCategory(options.category);
      }
      
      if (options.tag) {
        results = getProjectsByTag(options.tag);
      }
      
      if (options.search) {
        results = searchPortfolioProjects(options.search);
      }

      // 按發布日期排序（最新的在前）
      results.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

      // 實現分頁
      const page = options.page || 1;
      const limit = options.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProjects = results.slice(startIndex, endIndex);

      return {
        projects: paginatedProjects,
        pagination: {
          current: page,
          total: results.length,
          pageSize: limit,
          totalPages: Math.ceil(results.length / limit)
        }
      };
    } catch (error) {
      console.error('獲取項目列表失敗:', error);
      throw new Error('無法獲取項目列表');
    }
  }

  /**
   * 根據 ID 獲取單個項目
   * @param {string} id - 項目 ID
   * @returns {Promise<Object|null>} 項目詳情
   */
  async getProjectById(id) {
    try {
      const project = portfolioProjects.find(project => project.id === id);
      if (!project) {
        throw new Error('項目未找到');
      }
      return project;
    } catch (error) {
      console.error('獲取項目詳情失敗:', error);
      throw new Error('無法獲取項目詳情');
    }
  }

  /**
   * 獲取所有項目類別
   * @returns {Promise<Array>} 類別列表
   */
  async getCategories() {
    try {
      const categories = [...new Set(portfolioProjects.map(project => project.category))];
      return categories.sort();
    } catch (error) {
      console.error('獲取類別列表失敗:', error);
      throw new Error('無法獲取類別列表');
    }
  }

  /**
   * 獲取所有技術標籤
   * @returns {Promise<Array>} 技術標籤列表
   */
  async getTechnologies() {
    try {
      const technologies = portfolioProjects.reduce((acc, project) => {
        if (project.technologies) {
          acc.push(...project.technologies);
        }
        return acc;
      }, []);
      
      return [...new Set(technologies)].sort();
    } catch (error) {
      console.error('獲取技術標籤失敗:', error);
      throw new Error('無法獲取技術標籤');
    }
  }

  /**
   * 獲取精選項目
   * @returns {Promise<Array>} 精選項目列表
   */
  async getFeaturedProjects() {
    try {
      return getPortfolioFeaturedProjects();
    } catch (error) {
      console.error('獲取精選項目失敗:', error);
      throw new Error('無法獲取精選項目');
    }
  }

  /**
   * 獲取最新項目
   * @param {number} limit - 限制數量
   * @returns {Promise<Array>} 最新項目列表
   */
  async getLatestProjects(limit = 3) {
    try {
      return portfolioProjects
        .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
        .slice(0, limit);
    } catch (error) {
      console.error('獲取最新項目失敗:', error);
      throw new Error('無法獲取最新項目');
    }
  }

  /**
   * 根據狀態獲取項目
   * @param {string} status - 項目狀態 (completed, in-progress, planned)
   * @returns {Promise<Array>} 項目列表
   */
  async getProjectsByStatus(status) {
    try {
      return portfolioProjects.filter(project => project.status === status);
    } catch (error) {
      console.error('根據狀態獲取項目失敗:', error);
      throw new Error('無法根據狀態獲取項目');
    }
  }

  /**
   * 簡化的獲取所有項目方法（用於舊版兼容）
   * @returns {Promise<Array>} 項目列表
   */
  async getProjects() {
    const result = await this.getAllProjects();
    return result.projects;
  }
}

// 創建服務實例
const portfolioService = new PortfolioService();

export default portfolioService;

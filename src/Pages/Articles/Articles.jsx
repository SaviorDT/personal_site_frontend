import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticlesHeader from './ArticlesHeader/ArticlesHeader';
import ArticlesFilters from './ArticlesFilters/ArticlesFilters';
import ArticlesStats from './ArticlesStats/ArticlesStats';
import ArticlesGrid from './ArticlesGrid/ArticlesGrid';
import ArticlesPagination from './ArticlesPagination/ArticlesPagination';
import articleService from '@/services/articleService';
import './Articles.css';

const Articles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 12,
    totalPages: 0
  });

  // 載入初始數據
  useEffect(() => {
    loadInitialData();
  }, []);

  // 當篩選條件改變時重新載入文章
  useEffect(() => {
    loadArticles();
  }, [filters, pagination.current]);

  const loadInitialData = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        articleService.getAllCategories(),
        articleService.getPopularTags(15)
      ]);
      
      setCategories(categoriesData);
      setPopularTags(tagsData);
    } catch (err) {
      console.error('載入初始數據失敗:', err);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };

      // 如果有搜尋關鍵字，使用搜尋功能
      const result = filters.search 
        ? await articleService.searchArticles(filters.search, options)
        : await articleService.getAllArticles(options);

      setArticles(result.articles);
      
      if (result.pagination) {
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages
        }));
      } else {
        // 搜尋結果的分頁處理
        setPagination(prev => ({
          ...prev,
          total: result.total,
          totalPages: Math.ceil(result.total / prev.pageSize)
        }));
      }

    } catch (err) {
      console.error('載入文章失敗:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 處理篩選器改變
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      current: 1 // 重置到第一頁
    }));
  };

  // 處理搜尋
  const handleSearch = (searchTerm) => {
    handleFilterChange('search', searchTerm);
  };

  // 處理文章點擊
  const handleArticleClick = (article, event) => {
    const articleUrl = `/文章/${article.id}`;
    
    // 檢查是否為中鍵點擊或 Ctrl+點擊
    if (event && (event.button === 1 || event.ctrlKey || event.metaKey)) {
      // 在新分頁中開啟
      window.open(articleUrl, '_blank');
    } else {
      // 在當前頁面導航
      navigate(articleUrl);
    }
  };

  // 處理分頁
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      current: page
    }));
    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 清除所有篩選
  const clearFilters = () => {
    setFilters({
      category: '',
      tag: '',
      search: ''
    });
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  return (
    <section id="文章" className="articles-page">
      <div className="articles-container">
        
        {/* 頁面標題 */}
        <ArticlesHeader />

        {/* 篩選器 */}
        <ArticlesFilters
          filters={filters}
          categories={categories}
          popularTags={popularTags}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onClearFilters={clearFilters}
        />

        {/* 結果統計 */}
        <ArticlesStats 
          loading={loading}
          total={pagination.total}
        />

        {/* 文章列表 */}
        <div className="articles-content">
          <ArticlesGrid
            loading={loading}
            error={error}
            articles={articles}
            onArticleClick={handleArticleClick}
            onRetry={loadArticles}
          />

          {/* 分頁器 */}
          <ArticlesPagination
            currentPage={pagination.current}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </section>
  );
};

export default Articles;

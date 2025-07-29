import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadArticleComponent, getArticleMetadata } from '@/data/articles/frontendArticles.js';
import { ROUTES } from '@/router/index.jsx';
import ArticleContainer from './ArticleContainer/ArticleContainer';
import './ArticleDetail.css';

// 載入狀態組件
const LoadingState = () => (
  <div className="article-detail-page">
    <div className="article-loading">
      <div className="loading-spinner"></div>
      <p>載入文章中...</p>
    </div>
  </div>
);

// 錯誤狀態組件
const ErrorState = ({ error, onGoBack }) => (
  <div className="article-detail-page">
    <div className="article-error">
      <h2>😕 文章載入失敗</h2>
      <p>{error}</p>
      <button className="back-btn" onClick={onGoBack}>
        ← 返回文章列表
      </button>
    </div>
  </div>
);

// 未找到文章狀態組件
const NotFoundState = ({ onGoBack }) => (
  <div className="article-detail-page">
    <div className="article-error">
      <h2>📄 找不到文章</h2>
      <p>您請求的文章不存在或已被移除。</p>
      <button className="back-btn" onClick={onGoBack}>
        ← 返回文章列表
      </button>
    </div>
  </div>
);

// 導航欄組件
const ArticleNavigation = ({ onGoBack, metadata }) => (
  <nav className="article-nav">
    <button className="back-btn" onClick={onGoBack}>
      ← 返回文章列表
    </button>
    <div className="article-nav-info">
      <span className="article-category-nav">{metadata?.category}</span>
      <span className="article-read-time-nav">約 {metadata?.readTime} 分鐘</span>
    </div>
  </nav>
);

// 相關文章組件
const RelatedArticles = () => (
  <aside className="related-articles">
    <h3>您可能也會喜歡</h3>
    <div className="related-articles-grid">
      <div className="related-article-placeholder">
        <p>更多精彩文章即將到來...</p>
      </div>
    </div>
  </aside>
);

const ArticleDetail = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [ArticleComponent, setArticleComponent] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 處理返回文章列表
  const handleGoBack = () => {
    navigate(ROUTES.ARTICLES);
  };

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        // 獲取 metadata
        const articleMetadata = getArticleMetadata(articleId);
        if (!articleMetadata) {
          throw new Error('Article not found');
        }
        setMetadata(articleMetadata);

        // 動態載入組件
        const component = await loadArticleComponent(articleId);
        if (!component) {
          throw new Error('Failed to load article component');
        }
        setArticleComponent(() => component);
      } catch (err) {
        setError(err.message);
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  // 渲染不同狀態
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onGoBack={handleGoBack} />;
  }

  if (!ArticleComponent) {
    return <NotFoundState onGoBack={handleGoBack} />;
  }

  return (
    <div className="article-detail-page">
      <ArticleNavigation onGoBack={handleGoBack} metadata={metadata} />
      
      <main className="article-main">
        <ArticleContainer metadata={metadata}>
          <ArticleComponent />
        </ArticleContainer>
      </main>

      <RelatedArticles />
    </div>
  );
};

export default ArticleDetail;

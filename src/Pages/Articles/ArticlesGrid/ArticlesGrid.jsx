import React from 'react';
import { useTranslation } from 'react-i18next';
import ArticleCard from '@/Components/ArticleCard/ArticleCard';
import './ArticlesGrid.css';

const ArticlesGrid = ({ 
  loading, 
  error, 
  articles, 
  onArticleClick, 
  onRetry 
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="articles-loading">
        <div className="loading-spinner"></div>
        <span>{t('articles.loading', '載入中...')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="articles-error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button onClick={onRetry} className="retry-btn">
          {t('articles.retry', '重試')}
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="articles-empty">
        <span className="empty-icon">📝</span>
        <h3>{t('articles.empty.title', '暫無文章')}</h3>
        <p>{t('articles.empty.message', '目前沒有符合條件的文章，請嘗試調整篩選條件。')}</p>
      </div>
    );
  }

  return (
    <div className="articles-grid">
      {articles.map(article => (
        <ArticleCard
          key={article.id}
          article={article}
          onClick={onArticleClick}
        />
      ))}
    </div>
  );
};

export default ArticlesGrid;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './ArticleCard.css';

const ArticleCard = ({ article, onClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 截斷文本的工具函數
  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 處理點擊事件
  const handleClick = (event) => {
    // 防止事件冒泡
    event.preventDefault();
    
    if (onClick) {
      onClick(article, event);
    } else {
      // 預設行為：導航到文章詳細頁面
      const articleUrl = `/文章/${article.id}`;
      
      // 檢查是否為中鍵點擊或 Ctrl+點擊
      if (event && (event.button === 1 || event.ctrlKey || event.metaKey)) {
        // 在新分頁中開啟
        window.open(articleUrl, '_blank');
      } else {
        // 在當前頁面導航
        navigate(articleUrl);
      }
    }
  };

  // 處理鼠標按下事件（支援中鍵點擊）
  const handleMouseDown = (event) => {
    // 中鍵點擊
    if (event.button === 1) {
      event.preventDefault();
      handleClick(event);
    }
  };

  // 處理圖片載入錯誤
  const handleImageError = (e) => {
    e.target.src = '/images/articles/default-thumbnail.svg';
  };

  return (
    <article 
      className="article-card" 
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => e.preventDefault()} // 防止右鍵選單干擾
    >
      <div className="article-thumbnail">
        <img 
          src={article.thumbnail || '/images/articles/default-thumbnail.svg'}
          alt={article.title}
          onError={handleImageError}
          loading="lazy"
        />
        <div className="article-overlay">
          <div className="article-category">
            {article.category}
          </div>
        </div>
      </div>
      
      <div className="article-content">
        <div className="article-meta">
          <span className="article-author">{article.author}</span>
          <span className="article-date">{formatDate(article.publishDate)}</span>
          {article.readTime && (
            <span className="article-read-time">
              {article.readTime} {t('articles.readTime', '分鐘閱讀')}
            </span>
          )}
        </div>
        
        <h3 className="article-title">{article.title}</h3>
        
        <p className="article-excerpt">
          {truncateText(article.excerpt)}
        </p>
        
        <div className="article-tags">
          {article.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="article-tag">
              #{tag}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className="article-tag-more">
              +{article.tags.length - 3}
            </span>
          )}
        </div>
      </div>
      
      <div className="article-footer">
        <div className="article-stats">
          {article.viewCount && (
            <span className="stat-item">
              <span className="stat-icon">👁️</span>
              <span className="stat-text">{article.viewCount}</span>
            </span>
          )}
          {article.likeCount && (
            <span className="stat-item">
              <span className="stat-icon">❤️</span>
              <span className="stat-text">{article.likeCount}</span>
            </span>
          )}
          {article.commentCount && (
            <span className="stat-item">
              <span className="stat-icon">💬</span>
              <span className="stat-text">{article.commentCount}</span>
            </span>
          )}
        </div>
        
        <button className="read-more-btn">
          {t('articles.readMore', '閱讀更多')}
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </article>
  );
};

export default ArticleCard;

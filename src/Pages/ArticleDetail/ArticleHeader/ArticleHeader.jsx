import React from 'react';
import './ArticleHeader.css';

const ArticleHeader = ({ metadata, className = '' }) => {
  if (!metadata) return null;

  return (
    <header className={`article-header ${className}`}>
      <div className="article-meta-top">
        <span className="article-category">{metadata.category}</span>
        {metadata.difficulty && (
          <span className="article-difficulty">{metadata.difficulty}</span>
        )}
        {metadata.featured && <span className="article-featured">精選</span>}
      </div>
      
      <h1 className="article-title">{metadata.title}</h1>
      
      <div className="article-meta">
        <span className="article-author">作者：{metadata.author}</span>
        <span className="article-date">{metadata.publishDate}</span>
        <span className="article-read-time">閱讀時間：{metadata.readTime} 分鐘</span>
      </div>
      
      <div className="article-tags">
        {metadata.tags.map(tag => (
          <span key={tag} className="article-tag">{tag}</span>
        ))}
      </div>
    </header>
  );
};

export default ArticleHeader;

import React from 'react';
import ArticleHeader from '../ArticleHeader/ArticleHeader';
import ArticleFooter from '../ArticleFooter/ArticleFooter';
import './ArticleContainer.css';

const ArticleContainer = ({ 
  metadata, 
  children, 
  showHeader = true, 
  showFooter = true,
  className = '' 
}) => {
  return (
    <article className={`article-container ${className}`}>
      {showHeader && <ArticleHeader metadata={metadata} />}
      
      <div className="article-content">
        {children}
      </div>
      
      {showFooter && (
        <ArticleFooter 
          articleId={metadata?.id} 
          metadata={metadata} 
        />
      )}
    </article>
  );
};

export default ArticleContainer;

import React from 'react';
import ArticleActions from '../ArticleActions/ArticleActions';
import './ArticleFooter.css';

const ArticleFooter = ({ articleId, metadata, className = '' }) => {
  return (
    <footer className={`article-footer ${className}`}>
      <ArticleActions articleId={articleId} />
      
      {metadata?.lastModified && (
        <div className="article-meta-bottom">
          <p>最後更新：{metadata.lastModified}</p>
        </div>
      )}
    </footer>
  );
};

export default ArticleFooter;

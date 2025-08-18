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
  // 根據 metadata 設定容器寬度類別
  const getWidthClass = () => {
    if (!metadata?.layout?.containerWidth) return '';
    
    switch (metadata.layout.containerWidth) {
      case 'wide':
        return 'article-container-wide';
      case 'full':
        return 'article-container-full';
      case 'normal':
      default:
        return '';
    }
  };

  // 設定自定義最大寬度
  const getCustomStyles = () => {
    const styles = {};
    
    if (metadata?.layout?.maxWidth) {
      styles['--custom-max-width'] = metadata.layout.maxWidth;
    }
    
    // 全寬模式的特殊處理
    if (metadata?.layout?.containerWidth === 'full') {
      if (metadata?.layout?.maxWidth) {
        // 有 maxWidth 時，置中顯示
        styles.margin = '0 auto';
        styles.padding = '40px 20px';
      } else {
        // 沒有 maxWidth 時，真正全寬
        styles.margin = '0';
        styles.padding = '40px 2vw';
      }
    }
    
    return styles;
  };

  const widthClass = getWidthClass();
  const customStyles = getCustomStyles();

  return (
    <article 
      className={`article-container ${widthClass} ${className}`}
      style={customStyles}
    >
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

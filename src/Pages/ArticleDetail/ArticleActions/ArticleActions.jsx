import React, { useState, useEffect } from 'react';
import articleInteractionService from '@/services/articleInteractionService.js';
import './ArticleActions.css';

const ArticleActions = ({ articleId, className = '' }) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState(true);

  // 載入喜歡數量
  useEffect(() => {
    const loadLikeCount = async () => {
      try {
        setLoadingLikes(true);
        const count = await articleInteractionService.getLikeCount(articleId);
        setLikeCount(count);
      } catch (error) {
        console.error('載入喜歡數量失敗:', error);
        setLikeCount(0);
      } finally {
        setLoadingLikes(false);
      }
    };

    if (articleId) {
      loadLikeCount();
    }
  }, [articleId]);

  // 處理喜歡按鈕點擊
  const handleLike = async () => {
    try {
      await articleInteractionService.toggleLike(articleId);
      // 這裡應該從 API 響應更新狀態
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      articleInteractionService.showNotification(error.message, 'error');
    }
  };

  // 處理分享按鈕點擊
  const handleShare = async () => {
    try {
      const url = await articleInteractionService.copyArticleUrl(articleId);
      articleInteractionService.showNotification('文章網址已複製到剪貼板！', 'success');
    } catch (error) {
      articleInteractionService.showNotification(error.message, 'error');
    }
  };

  // 處理收藏按鈕點擊
  const handleBookmark = async () => {
    try {
      await articleInteractionService.bookmarkArticle(articleId);
    } catch (error) {
      articleInteractionService.showNotification(error.message, 'error');
    }
  };

  return (
    <div className={`article-actions ${className}`}>
      <button 
        className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
        onClick={handleLike}
        disabled={loadingLikes}
        title={isLiked ? '取消喜歡' : '喜歡這篇文章'}
      >
        ❤️ 喜歡 ({loadingLikes ? '...' : likeCount})
      </button>
      
      <button 
        className="action-btn share-btn"
        onClick={handleShare}
        title="分享文章"
      >
        📤 分享
      </button>
      
      <button 
        className="action-btn bookmark-btn"
        onClick={handleBookmark}
        title="收藏文章"
      >
        🔖 收藏
      </button>
    </div>
  );
};

export default ArticleActions;

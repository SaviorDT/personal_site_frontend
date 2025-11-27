import React from 'react';
import ReactionButtons from '@/Components/Reaction/ReactionButtons';
import articleInteractionService from '@/services/articleInteractionService.js';
import './ArticleActions.css';

const ArticleActions = ({ articleId, className = '' }) => {

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
      {/* 反應按鈕 */}
      <div className="article-reactions">
        <ReactionButtons targetId={articleId} targetType="post" />
      </div>

      {/* 其他操作按鈕 */}
      <div className="article-other-actions">
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
    </div>
  );
};

export default ArticleActions;

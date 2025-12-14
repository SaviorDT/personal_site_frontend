import React from 'react';
import ReactionButtons from '@/Components/Reaction/ReactionButtons';
import articleInteractionService from '@/services/articleInteractionService.js';
import './ArticleActions.css';

<<<<<<< HEAD
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import postService from '@/services/postService';
import { ROUTES } from '@/router/index';

const ArticleActions = ({ articleId, authorId, className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
=======
const ArticleActions = ({ articleId, className = '' }) => {
>>>>>>> upstream/golang-programing-class

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

  // 處理刪除按鈕點擊
  const handleDelete = async () => {
    if (window.confirm('確定要刪除這篇文章嗎？此操作無法復原。')) {
      try {
        await postService.deletePost(articleId);
        window.alert('文章已刪除');
        window.location.href = ROUTES.ARTICLES;
      } catch (error) {
        articleInteractionService.showNotification('刪除失敗：' + error.message, 'error');
      }
    }
  };

  // Check if current user is author or admin
  const isAuthorString = String(authorId);
  const userIdString = user ? String(user.ID || user.id) : '';
  const canDelete = user && (isAuthorString === userIdString || user.role === 'admin' || user.isAdmin);

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
<<<<<<< HEAD

        {canDelete && (
          <button
            className="action-btn delete-btn"
            onClick={handleDelete}
            title="刪除文章"
          >
            🗑️ 刪除
          </button>
        )}
=======
>>>>>>> upstream/golang-programing-class
      </div>
    </div>
  );
};

export default ArticleActions;

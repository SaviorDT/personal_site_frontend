import React, { useState } from 'react';
import CommentForm from './CommentForm';
import ReactionButtons from '../Reaction/ReactionButtons';
import './CommentItem.css';

const CommentItem = ({ comment, onReply, onUpdate, onDelete, level = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const MAX_LEVEL = 5;
  const canNest = level < MAX_LEVEL;
<<<<<<< HEAD

  // Normalize fields (Backend sends PascalCase, Frontend expects camelCase/snake_case)
  const content = comment.content || comment.Content;
  const author = comment.author || comment.Author;
  const authorName = author?.nickname || author?.Nickname || comment.author_name;
  const createdAt = comment.created_at || comment.CreatedAt;
  const updatedAt = comment.updated_at || comment.UpdatedAt;
  const replies = comment.replies || comment.Replies || [];
  const hasReplies = replies && replies.length > 0;

  const handleReply = async (replyContent) => {
    try {
      await onReply(replyContent, comment.ID);
=======
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleReply = async (content) => {
    try {
      await onReply(content, comment.ID);
>>>>>>> upstream/golang-programing-class
      setShowReplyForm(false);
    } catch (err) {
      console.error('回覆失敗:', err);
    }
  };

<<<<<<< HEAD
  const handleUpdate = async (newContent) => {
    try {
      await onUpdate(comment.ID, newContent);
=======
  const handleUpdate = async (content) => {
    try {
      await onUpdate(comment.ID, { content });
>>>>>>> upstream/golang-programing-class
      setIsEditing(false);
    } catch (err) {
      console.error('更新失敗:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('確定要刪除這則留言嗎？')) {
      try {
        await onDelete(comment.ID);
      } catch (err) {
        console.error('刪除失敗:', err);
      }
    }
  };

  const formatDate = (dateString) => {
<<<<<<< HEAD
    if (!dateString) return '';
=======
>>>>>>> upstream/golang-programing-class
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins} 分鐘前`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} 小時前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-TW');
  };

<<<<<<< HEAD
  console.log('[Debug CommentItem] Comment:', comment);
=======
>>>>>>> upstream/golang-programing-class
  return (
    <div className={`comment-item level-${Math.min(level, MAX_LEVEL)}`}>
      <div className="comment-content-wrapper">
        <div className="comment-avatar">
<<<<<<< HEAD
          {authorName ? authorName.charAt(0).toUpperCase() : 'A'}
=======
          {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : 'A'}
>>>>>>> upstream/golang-programing-class
        </div>

        <div className="comment-main">
          <div className="comment-header-info">
<<<<<<< HEAD
            <span className="comment-author">{authorName || '匿名使用者'}</span>
            <span className="comment-date">{formatDate(createdAt)}</span>
            {updatedAt !== createdAt && (
=======
            <span className="comment-author">{comment.author_name || '匿名使用者'}</span>
            <span className="comment-date">{formatDate(comment.CreatedAt)}</span>
            {comment.UpdatedAt !== comment.CreatedAt && (
>>>>>>> upstream/golang-programing-class
              <span className="comment-edited">(已編輯)</span>
            )}
          </div>

          {isEditing ? (
            <CommentForm
<<<<<<< HEAD
              initialContent={content}
=======
              initialContent={comment.content}
>>>>>>> upstream/golang-programing-class
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              submitLabel="更新"
            />
          ) : (
<<<<<<< HEAD
            <p className="comment-content">{content}</p>
=======
            <p className="comment-text">{comment.content}</p>
>>>>>>> upstream/golang-programing-class
          )}

          <div className="comment-actions">
            <ReactionButtons
              targetId={comment.ID}
              targetType="comment"
<<<<<<< HEAD
              reactions={comment.reactions || comment.Reactions || []}
=======
              reactions={comment.reactions || []}
>>>>>>> upstream/golang-programing-class
            />

            <div className="comment-buttons">
              {canNest && (
                <button
                  className="btn-comment-action"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  💬 回覆
                </button>
              )}
              <button
                className="btn-comment-action"
                onClick={() => setIsEditing(!isEditing)}
              >
                ✏️ 編輯
              </button>
              <button
                className="btn-comment-action btn-delete"
                onClick={handleDelete}
              >
                🗑️ 刪除
              </button>
            </div>
          </div>

          {showReplyForm && canNest && (
            <div className="reply-form-container">
              <CommentForm
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
<<<<<<< HEAD
                placeholder={`回覆 @${authorName || '匿名使用者'}...`}
=======
                placeholder={`回覆 @${comment.author_name || '匿名使用者'}...`}
>>>>>>> upstream/golang-programing-class
              />
            </div>
          )}
        </div>
      </div>

      {hasReplies && (
        <div className="comment-replies">
          {!canNest && (
            <div className="max-level-warning">
              已達到最大回覆層級
            </div>
          )}

          {hasReplies && (
            <button
              className="btn-toggle-replies"
              onClick={() => setShowReplies(!showReplies)}
            >
<<<<<<< HEAD
              {showReplies ? '隱藏' : '顯示'} {replies.length} 則回覆
            </button>
          )}

          {showReplies && replies.map(reply => (
=======
              {showReplies ? '隱藏' : '顯示'} {comment.replies.length} 則回覆
            </button>
          )}

          {showReplies && comment.replies.map(reply => (
>>>>>>> upstream/golang-programing-class
            <CommentItem
              key={reply.ID}
              comment={reply}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;

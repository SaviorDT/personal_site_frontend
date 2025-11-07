import React, { useEffect, useState } from 'react';
import { useComments } from '@/hooks/useComments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import './CommentList.css';

const CommentList = ({ postId }) => {
  const { commentTree, loading, error, fetchComments, createComment, updateComment, deleteComment } = useComments(postId);
  const [showMainForm, setShowMainForm] = useState(false);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, fetchComments]);

  const handleCreateComment = async (content) => {
    try {
      await createComment(content);
      setShowMainForm(false);
    } catch (err) {
      console.error('留言失敗:', err);
    }
  };

  if (loading && commentTree.length === 0) {
    return (
      <div className="comment-list">
        <div className="comment-loading">載入留言中...</div>
      </div>
    );
  }

  return (
    <div className="comment-list">
      <div className="comment-header">
        <h3 className="comment-title">💬 留言 ({commentTree.length})</h3>
        <button className="btn-add-comment" onClick={() => setShowMainForm(!showMainForm)}>
          {showMainForm ? '取消' : '✍️ 發表留言'}
        </button>
      </div>

      {/* 只在特定錯誤時顯示,且樣式不那麼顯眼 */}
      {error && !error.includes('Failed to fetch') && (
        <div className="comment-error">{error}</div>
      )}

      {showMainForm && (
        <div className="main-comment-form">
          <CommentForm
            onSubmit={handleCreateComment}
            onCancel={() => setShowMainForm(false)}
            placeholder="分享你的想法..."
          />
        </div>
      )}

      {commentTree.length === 0 ? (
        <div className="comment-empty">
          <p>還沒有留言，來當第一個留言的人吧！</p>
        </div>
      ) : (
        <div className="comments-tree">
          {commentTree.map(comment => (
            <CommentItem
              key={comment.ID}
              comment={comment}
              onReply={createComment}
              onUpdate={updateComment}
              onDelete={deleteComment}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;

import React, { useEffect, useState } from 'react';
import { useReactions } from '@/hooks/useReactions';
import './ReactionButtons.css';

const ReactionButtons = ({
  postId = null,
  commentId = null,
  targetId = null,
  type = 'post',
  targetType = null
}) => {
  // 支援兩種參數格式: (postId/commentId, type) 或 (targetId, targetType)
  const actualType = targetType || type;
  const actualId = targetId || (actualType === 'post' ? postId : commentId);
  const [errorMessage, setErrorMessage] = useState(null);

  const { reactions, loading, fetchReactions, addReaction, hasUserReacted, getReactionCount, REACTION_INFO } = useReactions(actualType);

  useEffect(() => {
    if (actualId) fetchReactions(actualId);
  }, [actualId, fetchReactions]);

  const handleReaction = async (reactionType) => {
    if (loading || !actualId) return;
    setErrorMessage(null); // 清除之前的錯誤
    try {
      await addReaction(actualId, reactionType);
    } catch (err) {
      console.error('反應失敗:', err);

      // 取得錯誤訊息
      const errorMsg = err.message || err.error || String(err);
      console.log('錯誤訊息:', errorMsg); // Debug 用

      // 檢查是否為授權錯誤
      if (errorMsg.includes('Authorization') ||
        errorMsg.includes('cookie') ||
        errorMsg.includes('required') ||
        errorMsg.includes('登入') ||
        errorMsg.includes('unauthorized')) {
        setErrorMessage('請先登入才能按反應 🔐');
      } else {
        setErrorMessage(`操作失敗: ${errorMsg}`);
      }
      // 5秒後自動清除錯誤訊息
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <div className="reaction-buttons-container">
      {errorMessage && (
        <div className="reaction-error-message">
          {errorMessage}
        </div>
      )}
      <div className="reaction-buttons">
        {REACTION_INFO.map(({ type: reactionType, emoji, label }) => {
          const count = getReactionCount(reactionType);
          const isActive = hasUserReacted(reactionType);
          return (
            <button
              key={reactionType}
              className={`reaction-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleReaction(reactionType)}
              title={label}
              disabled={loading}
            >
              <span className="reaction-emoji">{emoji}</span>
              <span className="reaction-count">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ReactionButtons;

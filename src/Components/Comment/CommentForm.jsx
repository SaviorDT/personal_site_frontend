import React, { useState } from 'react';
import './CommentForm.css';

const CommentForm = ({
  onSubmit,
  onCancel,
  initialContent = '',
  placeholder = '寫下你的留言...',
  submitLabel = '送出'
}) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('留言內容不能為空');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      setError(err.message || '送出失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        disabled={isSubmitting}
      />

      {error && <div className="comment-form-error">{error}</div>}

      <div className="comment-form-actions">
        <button
          type="submit"
          className="btn-submit-comment"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? '送出中...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn-cancel-comment"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
};

export default CommentForm;

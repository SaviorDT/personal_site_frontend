import { useState, useCallback } from 'react';
import commentService from '@/services/commentService';

export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [commentTree, setCommentTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await commentService.getComments(postId);

      if (result.success) {
        const commentsList = result.data.comments || [];
        setComments(commentsList);

        const tree = commentService.buildCommentTree(commentsList);
        setCommentTree(tree);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || '取得留言失敗');
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const createComment = useCallback(async (content, parentId = null) => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await commentService.createComment(postId, {
        content,
        parent_id: parentId,
      });

      if (result.success) {
        await fetchComments();
        return result.data.comment;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || '留言失敗');
      console.error('Failed to create comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [postId, fetchComments]);

  const updateComment = useCallback(async (commentId, content) => {
    setLoading(true);
    setError(null);

    try {
      const result = await commentService.updateComment(commentId, { content });

      if (result.success) {
        setComments(prev =>
          prev.map(comment =>
            comment.ID === commentId
              ? { ...comment, content, updated_at: new Date().toISOString() }
              : comment
          )
        );

        const updatedComments = comments.map(comment =>
          comment.ID === commentId ? { ...comment, content } : comment
        );
        const tree = commentService.buildCommentTree(updatedComments);
        setCommentTree(tree);

        return result.data.comment;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || '更新留言失敗');
      console.error('Failed to update comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [comments]);

  const deleteComment = useCallback(async (commentId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await commentService.deleteComment(commentId);

      if (result.success) {
        await fetchComments();
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || '刪除留言失敗');
      console.error('Failed to delete comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchComments]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    comments,
    commentTree,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    clearError,
  };
}

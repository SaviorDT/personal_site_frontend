import { useState, useCallback } from 'react';
import postService from '@/services/postService';

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchPosts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await postService.getPosts({
        page: pagination.page,
        page_size: pagination.pageSize,
        ...params,
      });

      if (result.success) {
        setPosts(result.data.posts || []);
        if (result.data.pagination) {
          setPagination(prev => ({ ...prev, ...result.data.pagination }));
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || '取得文章列表失');
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]);

  const fetchPost = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const result = await postService.getPost(id);

      if (result.success) {
        setCurrentPost(result.data.post);
        return result.data.post;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || '取得文章失敗');
      console.error('Failed to fetch post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (postData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await postService.createPost(postData);

      if (result.success) {
        setPosts(prev => [result.data.post, ...prev]);
        return result.data.post;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || '建立文章失敗');
      console.error('Failed to create post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);

    try {
      const result = await postService.updatePost(id, updates);

      if (result.success) {
        setPosts(prev => prev.map(post => post.ID === id ? result.data.post : post));
        if (currentPost?.ID === id) {
          setCurrentPost(result.data.post);
        }
        return result.data.post;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || '更新文章失敗');
      console.error('Failed to update post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPost]);

  const deletePost = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const result = await postService.deletePost(id);

      if (result.success) {
        setPosts(prev => prev.filter(post => post.ID !== id));
        if (currentPost?.ID === id) {
          setCurrentPost(null);
        }
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || '刪除文章失敗');
      console.error('Failed to delete post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPost]);

  const changePage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setPosts([]);
    setCurrentPost(null);
    setError(null);
    setPagination({
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    });
  }, []);

  return {
    posts,
    currentPost,
    loading,
    error,
    pagination,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    changePage,
    clearError,
    reset,
  };
}

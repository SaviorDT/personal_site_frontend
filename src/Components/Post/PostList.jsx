import React, { useEffect, useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import PostCard from './PostCard';
import PostEditor from './PostEditor';
import './PostList.css';

const PostList = () => {
  const {
    posts,
    loading,
    error,
    pagination,
    fetchPosts,
    changePage,
    createPost
  } = usePosts();

  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    console.log('[PostList] 開始載入文章...');
    fetchPosts().then(() => {
      console.log('[PostList] 文章載入完成');
    }).catch(err => {
      console.error('[PostList] 文章載入失敗:', err);
    });
  }, [fetchPosts]);

  const handleCreatePost = async (postData) => {
    try {
      await createPost(postData);
      setShowEditor(false);
      // 重新載入文章列表
      await fetchPosts();
    } catch (err) {
      throw err; // 讓 PostEditor 處理錯誤顯示
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="post-list-container">
        <div className="post-loading">
          <div className="loading-spinner"></div>
          <p>載入文章中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('[PostList] 顯示錯誤:', error);
    return (
      <div className="post-list-container">
        <div className="post-error">
          <h3>😕 載入失敗</h3>
          <p>{error}</p>
          <details style={{ marginTop: '16px', fontSize: '0.875rem', color: '#9CA3AF' }}>
            <summary style={{ cursor: 'pointer' }}>技術細節</summary>
            <pre style={{ marginTop: '8px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', overflow: 'auto' }}>
              {JSON.stringify({ error, timestamp: new Date().toISOString() }, null, 2)}
            </pre>
          </details>
          <button className="btn-retry" onClick={() => fetchPosts()}>
            重試
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0 && !showEditor) {
    return (
      <div className="post-list-container">
        <div className="post-empty">
          <h3>📄 目前沒有文章</h3>
          <p>還沒有發表任何文章</p>
          <button
            className="btn-create-post"
            onClick={() => setShowEditor(true)}
          >
            ✨ 發表第一篇文章
          </button>
        </div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <div className="post-list-container">
        <PostEditor
          onSubmit={handleCreatePost}
          onCancel={() => setShowEditor(false)}
        />
      </div>
    );
  }

  return (
    <div className="post-list-container">
      <div className="post-list-header">
        <h2>社群文章</h2>
        <button
          className="btn-new-post"
          onClick={() => setShowEditor(true)}
          disabled={loading}
        >
          ✍️ 新增文章
        </button>
      </div>

      <div className="post-grid">
        {posts.map(post => (
          <PostCard key={post.ID} post={post} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="post-pagination">
          <button
            className="pagination-btn"
            onClick={() => changePage(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            ← 上一頁
          </button>

          <div className="pagination-info">
            第 {pagination.page} / {pagination.totalPages} 頁
          </div>

          <button
            className="pagination-btn"
            onClick={() => changePage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            下一 →
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;

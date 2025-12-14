import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadArticleComponent, getArticleMetadata } from '@/data/articles/frontendArticles.js';
import { ROUTES } from '@/router/index.jsx';
import ArticleContainer from './ArticleContainer/ArticleContainer';
import CommentList from '@/components/Comment/CommentList';
import './ArticleDetail.css';
import apiClient from '@/services/apiClient';
import { isValidId } from '@/utils/idUtils';

// 載入狀態組件
const LoadingState = () => (
  <div className="article-detail-page">
    <div className="article-loading">
      <div className="loading-spinner"></div>
      <p>載入文章中...</p>
    </div>
  </div>
);

// 錯誤狀態組件
const ErrorState = ({ error, onGoBack }) => (
  <div className="article-detail-page">
    <div className="article-error">
      <h2>😕 文章載入失敗</h2>
      <p>{error}</p>
      <button className="back-btn" onClick={onGoBack}>
        ← 返回文章列表
      </button>
    </div>
  </div>
);

// 未找到文章狀態組件
const NotFoundState = ({ onGoBack }) => (
  <div className="article-detail-page">
    <div className="article-error">
      <h2>📄 找不到文章</h2>
      <p>您請求的文章不存在或已被移除。</p>
      <button className="back-btn" onClick={onGoBack}>
        ← 返回文章列表
      </button>
    </div>
  </div>
);

// 導航欄組件
const ArticleNavigation = ({ onGoBack, metadata }) => (
  <nav className="article-nav">
    <button className="back-btn" onClick={onGoBack}>
      ← 返回文章列表
    </button>
    <div className="article-nav-info">
      <span className="article-category-nav">{metadata?.category}</span>
      <span className="article-read-time-nav">約 {metadata?.readTime} 分鐘</span>
    </div>
  </nav>
);

// 相關文章組件
const RelatedArticles = () => (
  <aside className="related-articles">
    <h3>您可能也會喜歡</h3>
    <div className="related-articles-grid">
      <div className="related-article-placeholder">
        <p>更多精彩文章即將到來...</p>
      </div>
    </div>
  </aside>
);

const ArticleDetail = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [ArticleComponent, setArticleComponent] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [resolvedPostId, setResolvedPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 處理返回文章列表
  const handleGoBack = () => {
    navigate(ROUTES.ARTICLES);
  };

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        let articleMetadata = getArticleMetadata(articleId);
        let dynamicContentFound = false;

        // If not found in static registry, init as dynamic
        if (!articleMetadata) {
          articleMetadata = {
            id: articleId,
            title: articleId,
            category: 'Community',
            tags: [],
            layout: { containerWidth: 'medium' }
          };
        }
        setMetadata(articleMetadata);

        // Try Fetching from Backend (Dynamic)
        try {
          // Use encodeURIComponent to handle Chinese slugs safely
          const targetId = encodeURIComponent(String(articleId));

          const resp = await apiClient.get(`/posts/${targetId}`);
          const p = resp?.data?.post || resp?.data;

          if (p) {
            const pId = String(p.ID || p.id);
            setResolvedPostId(pId);

            // Update metadata with dynamic info
            setMetadata(prev => ({
              ...prev,
              title: p.Title || p.title,
              author: p.Author?.nickname || p.Author?.Nickname || p.author?.nickname || '匿名',
              authorId: p.AuthorID || p.author_id || p.author?.id,
              publishDate: (p.CreatedAt || p.created_at) ? new Date(p.CreatedAt || p.created_at).toLocaleDateString('zh-TW') : '',
              readTime: Math.ceil(((p.Content || p.content || '').length) / 500) || 3,
              tags: p.Tags?.map(t => t.Name || t.name) || p.tags?.map(t => t.name) || []
            }));

            // Render Logic: Check if there's a static component first
            // Even if we found a dynamic post (for ID/Reactions), we might want to use the static component for content
            // e.g. 'site-history' has a rich static component but also needs a DB entry
            let staticComponent = null;
            try {
              staticComponent = await loadArticleComponent(articleId);
            } catch (e) { /* ignore */ }

            if (staticComponent) {
              setArticleComponent(() => staticComponent);
            } else {
              // Only if NO static component, use the DB content
              const content = p.Content || p.content || '';
              setArticleComponent(() => () => (
                <div className="dynamic-article-content" style={{
                  whiteSpace: 'pre-wrap',
                  color: '#E5E7EB',
                  lineHeight: '1.8',
                  fontSize: '1.1rem',
                  padding: '20px 0'
                }}>
                  {content}
                </div>
              ));
            }
            dynamicContentFound = true;
          }
        } catch (apiErr) {
          // Not fatal yet, might be static or list scan needed
          if (!isValidId(articleId)) {
            // Fallback: Scan list for slug matching
            try {
              const listResp = await apiClient.get('/posts');
              const posts = Array.isArray(listResp?.data) ? listResp.data : (listResp?.data?.posts || []);
              const target = decodeURIComponent(String(articleId)).toLowerCase();
              const match = posts.find(p => {
                const slug = String(p.slug || p.Slug || '').toLowerCase();
                const title = String(p.title || p.Title || '').toLowerCase();
                return slug === target || title === target;
              });

              if (match) {
                setResolvedPostId(String(match.id || match.ID));
                setMetadata(prev => ({
                  ...prev,
                  title: match.title || match.Title,
                  author: match.Author?.nickname || '匿名',
                  authorId: match.AuthorID || match.author_id || match.author?.id,
                  readTime: Math.ceil(((match.Content || '').length) / 500) || 3
                }));
                const content = match.Content || match.content || '';
                setArticleComponent(() => () => (
                  <div className="dynamic-article-content" style={{
                    whiteSpace: 'pre-wrap',
                    color: '#E5E7EB',
                    lineHeight: '1.8',
                    fontSize: '1.1rem',
                    padding: '20px 0'
                  }}>
                    {content}
                  </div>
                ));
                dynamicContentFound = true;
              }
            } catch (scanErr) {
              console.warn('Scan failed', scanErr);
            }
          }
        }

        // If dynamic content NOT found, try static
        if (!dynamicContentFound) {
          try {
            const component = await loadArticleComponent(articleId);
            if (component) {
              setArticleComponent(() => component);
            } else {
              if (articleMetadata.category === 'Community') {
                setArticleComponent(() => () => (
                  <div className="dynamic-article-content">
                    <p>無法載入文章內容 (ID: {articleId})</p>
                  </div>
                ));
              }
            }
          } catch (staticErr) {
            setArticleComponent(() => () => <div className="dynamic-article-placeholder"></div>);
          }
        }

      } catch (err) {
        setError(err.message);
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  // 渲染不同狀態
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onGoBack={handleGoBack} />;
  }

  if (!ArticleComponent) {
    return <NotFoundState onGoBack={handleGoBack} />;
  }

  return (
    <div className={`article-detail-page ${metadata?.layout?.containerWidth === 'full' ? 'full-width' : ''}`}>
      <ArticleNavigation onGoBack={handleGoBack} metadata={metadata} />

      <main className={`article-main ${metadata?.layout?.containerWidth === 'full' ? 'article-main-full' : ''}`}>
        <ArticleContainer metadata={metadata} resolvedPostId={resolvedPostId}>
          <ArticleComponent />
        </ArticleContainer>

        {/* 留言系統 */}
        <section className="article-comments-section">
          <CommentList postId={resolvedPostId || articleId} />
        </section>
      </main>

      <RelatedArticles />
    </div>
  );
};

export default ArticleDetail;

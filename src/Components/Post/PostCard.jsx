import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactionButtons from '@/Components/Reaction/ReactionButtons';
import './PostCard.css';

const PostCard = ({ post }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleClick = () => {
    navigate(`/posts/${post.ID}`);
  };

  return (
    <article className="post-card">
      <div className="post-card-link" onClick={handleClick}>
        {post.cover_image && (
          <div className="post-thumbnail">
            <img src={post.cover_image} alt={post.title} />
          </div>
        )}
        
        <div className="post-content">
          <h3 className="post-title">{post.title}</h3>
          
          <p className="post-summary">
            {post.summary || post.content?.substring(0, 150) + '...'}
          </p>
          
          <div className="post-meta">
            <span className="post-author">
              👤 {post.author?.nickname || '匿名'}
            </span>
            <span className="post-views">
              👁️ {post.view_count || 0}
            </span>
            <span className="post-date">
              📅 {formatDate(post.CreatedAt || post.created_at)}
            </span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={tag.ID || index} 
                  className="post-tag"
                  style={{ backgroundColor: tag.color || '#6366F1' }}
                >
                  #{tag.name}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="post-tag-more">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="post-footer" onClick={(e) => e.stopPropagation()}>
        <ReactionButtons
          targetId={post.ID}
          targetType="post"
          reactions={post.reactions || []}
        />
      </div>
    </article>
  );
};

export default PostCard;

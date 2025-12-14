import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactionButtons from '@/components/Reaction/ReactionButtons';
import './PostCard.css';

const PostCard = ({ post }) => {
  const navigate = useNavigate();

  // Normalize fields (Backend sends PascalCase, Frontend expects camelCase/snake_case)
  const title = post.title || post.Title;
  const content = post.content || post.Content || '';
  const summary = post.summary || post.Summary || content.substring(0, 150) + '...';
  const coverImage = post.cover_image || post.CoverImage;
  const viewCount = post.view_count || post.ViewCount || 0;
  const author = post.author || post.Author;
  const authorName = author?.nickname || author?.Nickname || '匿名';
  const createdAt = post.created_at || post.CreatedAt;
  const tags = post.tags || post.Tags || [];
  const reactions = post.reactions || post.Reactions || [];
  // Use slug for navigation if available, otherwise ID
  const linkId = post.slug || post.Slug || post.ID;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleClick = () => {
    navigate(`/posts/${linkId}`);
  };

  return (
    <article className="post-card">
      <div className="post-card-link" onClick={handleClick}>
        {coverImage && (
          <div className="post-thumbnail">
            <img src={coverImage} alt={title} />
          </div>
        )}

        <div className="post-content">
          <h3 className="post-title">{title}</h3>

          <p className="post-summary">
            {summary}
          </p>

          <div className="post-meta">
            <span className="post-author">
              👤 {authorName}
            </span>
            <span className="post-views">
              👁️ {viewCount}
            </span>
            <span className="post-date">
              📅 {formatDate(createdAt)}
            </span>
          </div>

          {tags && tags.length > 0 && (
            <div className="post-tags">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={tag.ID || index}
                  className="post-tag"
                  style={{ backgroundColor: tag.color || '#6366F1' }}
                >
                  #{tag.name || tag.Name}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="post-tag-more">
                  +{tags.length - 3}
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
          reactions={reactions}
        />
      </div>
    </article>
  );
};

export default PostCard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  // 處理卡片點擊 - 跳轉到項目詳細頁面
  const handleCardClick = () => {
    navigate(`/作品集/${project.id}`);
  };

  // 處理查看源碼 - 阻止事件冒泡
  const handleViewCode = (e) => {
    e.stopPropagation(); // 阻止觸發卡片點擊
    if (project.githubUrl) {
      window.open(project.githubUrl, '_blank');
    }
  };

  // 截斷描述文字
  const truncateDescription = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div 
      className="project-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* 專案圖片 */}
      <div className="project-thumbnail">
        <img
          src={project.image || '/images/projects/default-project.svg'}
          alt={project.title}
          loading="lazy"
        />
        <div className="project-overlay">
          <div className="project-badges">
            <span className="project-category-badge">{project.category}</span>
            {project.featured && (
              <span className="project-featured-badge">精選</span>
            )}
          </div>
          <div className="project-status">
            {project.status && (
              <span className={`status-badge ${project.status}`}>
                {project.status === 'completed' ? '已完成' : 
                 project.status === 'in-progress' ? '進行中' : '計劃中'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 專案內容 */}
      <div className="project-content">
        <div className="project-meta">
          <span className="project-date">{project.year}</span>
          {project.duration && (
            <span className="project-duration">耗時 {project.duration}</span>
          )}
        </div>
        
        <h3 className="project-title">{project.title}</h3>
        
        <p className="project-description">
          {truncateDescription(project.description)}
        </p>

        {/* 技術標籤 */}
        <div className="project-technologies">
          {project.technologies.slice(0, 4).map((tech, index) => (
            <span key={index} className="tech-tag">
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="tech-tag-more">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* 專案動作 */}
      <div className="project-actions">
        <div className="project-links">
          {project.githubUrl && (
            <button 
              className="action-btn secondary"
              onClick={handleViewCode}
              title="查看源代碼"
            >
              <span className="btn-icon">💻</span>
              <span className="btn-text">源代碼</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

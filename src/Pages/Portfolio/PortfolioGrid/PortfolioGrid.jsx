import React from 'react';
import ProjectCard from '../ProjectCard/ProjectCard';
import './PortfolioGrid.css';

const PortfolioGrid = ({ projects, loading, error, onRetry }) => {
  // 載入狀態
  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner"></div>
        <p>載入作品中...</p>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="portfolio-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button className="retry-btn" onClick={onRetry}>
          重新載入
        </button>
      </div>
    );
  }

  // 空狀態
  if (!projects || projects.length === 0) {
    return (
      <div className="portfolio-empty">
        <div className="empty-icon">📂</div>
        <h3>沒有找到作品</h3>
        <p>目前沒有符合條件的作品，請嘗試調整篩選條件</p>
      </div>
    );
  }

  // 正常顯示作品網格
  return (
    <div className="portfolio-grid">
      {projects.map(project => (
        <ProjectCard 
          key={project.id} 
          project={project}
        />
      ))}
    </div>
  );
};

export default PortfolioGrid;

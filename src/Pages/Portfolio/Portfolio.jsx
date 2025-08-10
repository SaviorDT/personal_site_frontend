import React, { useState, useEffect } from 'react';
import PortfolioHeader from './PortfolioHeader/PortfolioHeader';
import PortfolioGrid from './PortfolioGrid/PortfolioGrid';
import portfolioService from '@/services/portfolioService';
import './Portfolio.css';

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 載入初始數據
  useEffect(() => {
    loadPortfolioData();
  }, []);

  // 載入作品集數據
  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 載入項目數據
      const projectsData = await portfolioService.getProjects();
      setProjects(projectsData || []);
    } catch (err) {
      console.error('載入作品集數據時發生錯誤:', err);
      setError('載入作品集失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-page">
      <div className="portfolio-container">
        <PortfolioHeader />
        
        <div className="portfolio-stats">
          <p className="stats-text">
            共 {projects.length} 個作品
          </p>
        </div>

        <PortfolioGrid 
          projects={projects}
          loading={loading}
          error={error}
          onRetry={loadPortfolioData}
        />
      </div>
    </div>
  );
};

export default Portfolio;

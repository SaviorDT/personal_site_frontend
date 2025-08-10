import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadProjectComponent } from '@/data/portfolio';
import portfolioService from '@/services/portfolioService';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [ProjectComponent, setProjectComponent] = useState(null);
  const [projectMetadata, setProjectMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 並行載入項目組件和 metadata
      const [component, metadata] = await Promise.all([
        loadProjectComponent(projectId),
        portfolioService.getProjectById(projectId)
      ]);

      if (!component || !metadata) {
        throw new Error('項目未找到');
      }

      setProjectComponent(() => component);
      setProjectMetadata(metadata);
    } catch (err) {
      console.error('載入項目失敗:', err);
      setError(err.message || '載入項目失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/作品集');
  };

  if (loading) {
    return (
      <div className="project-detail-loading">
        <div className="loading-spinner"></div>
        <p>載入項目中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-detail-error">
        <div className="error-content">
          <h2>載入失敗</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={loadProjectData} className="retry-btn">
              重新載入
            </button>
            <button onClick={handleGoBack} className="back-btn">
              返回作品集
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ProjectComponent || !projectMetadata) {
    return (
      <div className="project-detail-error">
        <div className="error-content">
          <h2>項目未找到</h2>
          <p>您要查看的項目不存在或已被移除</p>
          <button onClick={handleGoBack} className="back-btn">
            返回作品集
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      <div className="project-detail-header">
        <button onClick={handleGoBack} className="back-button">
          ← 返回作品集
        </button>
      </div>
      
      <div className="project-detail-content">
        <ProjectComponent />
      </div>
    </div>
  );
};

export default ProjectDetail;

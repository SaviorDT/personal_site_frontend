import React from 'react';
import './PreviewSections.css';

const PreviewSections = () => {
  const sections = [
    {
      id: 'about',
      title: '關於我',
      description: '了解我的背景、技能和經歷',
      icon: '👤',
      color: '#ff6b6b',
      features: ['個人簡介', '技術技能', '工作經歷', '教育背景']
    },
    {
      id: 'articles',
      title: '技術文章',
      description: '分享程式開發心得與技術見解',
      icon: '📝',
      color: '#4ecdc4',
      features: ['前端開發', 'React 教學', '最佳實踐', '新技術分享']
    },
    {
      id: 'portfolio',
      title: '作品集',
      description: '展示我的專案作品與開發成果',
      icon: '💼',
      color: '#45b7d1',
      features: ['網頁應用', '行動應用', '開源專案', '設計作品']
    }
  ];

  return (
    <section className="preview-sections">
      <div className="preview-container">
        <div className="section-header">
          <h2 className="section-title">探索更多內容</h2>
          <p className="section-subtitle">
            深入了解我的專業技能、創作內容和精彩作品
          </p>
        </div>
        
        <div className="sections-grid">
          {sections.map((section, index) => (
            <div 
              key={section.id}
              className="section-card"
              style={{ '--accent-color': section.color }}
            >
              <div className="card-background"></div>
              <div className="card-content">
                <div className="card-icon">
                  <span>{section.icon}</span>
                </div>
                
                <h3 className="card-title">{section.title}</h3>
                <p className="card-description">{section.description}</p>
                
                <ul className="card-features">
                  {section.features.map((feature, idx) => (
                    <li key={idx} className="feature-item">
                      <span className="feature-bullet">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="card-actions">
                  <button 
                    className="card-button"
                    onClick={() => {
                      // 這裡之後可以改為路由導航
                      alert(`即將前往${section.title}頁面`);
                    }}
                  >
                    <span>查看更多</span>
                    <div className="button-arrow">→</div>
                  </button>
                </div>
              </div>
              
              <div className="card-hover-effect"></div>
            </div>
          ))}
        </div>
        
        <div className="contact-preview">
          <div className="contact-card">
            <div className="contact-content">
              <h3 className="contact-title">讓我們開始對話</h3>
              <p className="contact-description">
                有任何想法或合作機會？歡迎與我聯繫！
              </p>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span>saviordt@example.com</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">💼</span>
                  <span>LinkedIn</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">🐙</span>
                  <span>GitHub</span>
                </div>
              </div>
            </div>
            <div className="contact-visual">
              <div className="contact-circles">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
                <div className="circle circle-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewSections;

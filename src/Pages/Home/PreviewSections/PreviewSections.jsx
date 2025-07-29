import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/router';
import './PreviewSections.css';

const PreviewSections = () => {
  const { t } = useTranslation();
  
  const sections = [
    {
      id: 'about',
      title: t('preview.sections.about.title'),
      description: t('preview.sections.about.description'),
      icon: '👤',
      color: '#ff6b6b',
      features: t('preview.sections.about.features', { returnObjects: true }),
      path: ROUTES.ABOUT
    },
    {
      id: 'articles',
      title: t('preview.sections.articles.title'),
      description: t('preview.sections.articles.description'),
      icon: '📝',
      color: '#4ecdc4',
      features: t('preview.sections.articles.features', { returnObjects: true }),
      path: ROUTES.ARTICLES
    },
    {
      id: 'portfolio',
      title: t('preview.sections.portfolio.title'),
      description: t('preview.sections.portfolio.description'),
      icon: '💼',
      color: '#45b7d1',
      features: t('preview.sections.portfolio.features', { returnObjects: true }),
      path: ROUTES.PORTFOLIO
    }
  ];

  return (
    <section className="preview-sections">
      <div className="preview-container">
        <div className="section-header">
          <h2 className="section-title">{t('preview.title')}</h2>
          <p className="section-subtitle">
            {t('preview.subtitle')}
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
                  <Link 
                    to={section.path}
                    className="card-button"
                  >
                    <span>{t('preview.viewMore')}</span>
                    <div className="button-arrow">→</div>
                  </Link>
                </div>
              </div>
              
              <div className="card-hover-effect"></div>
            </div>
          ))}
        </div>
        
        <div className="contact-preview">
          <div className="contact-card">
            <div className="contact-content">
              <h3 className="contact-title">{t('preview.contact.title')}</h3>
              <p className="contact-description">
                {t('preview.contact.description')}
              </p>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span>{t('preview.contact.email')}</span>
                </div>
                <a href="https://github.com/SaviorDT" target="_blank" rel="noopener noreferrer" className="contact-item">
                  <span className="contact-icon">🐙</span>
                  <span>GitHub</span>
                </a>
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

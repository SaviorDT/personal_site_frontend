import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './HeroSection.css';

const HeroSection = () => {
  const { t } = useTranslation();
  const [currentText, setCurrentText] = useState(0);
  
  const textArray = [
    t('hero.roles.web'),
    t('hero.roles.tools'),
    t('hero.roles.images'),
    t('hero.roles.news')
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % textArray.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [textArray.length]);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <section id="home" className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="greeting">{t('hero.greeting')}</span>
              <span className="name">{t('hero.name')}</span>
            </h1>
            
            <div className="hero-subtitle">
              <span className="static-text">{t('hero.staticText')}</span>
              <span className="dynamic-text">
                {textArray.map((text, index) => (
                  <span 
                    key={index}
                    className={`text-item ${index === currentText ? 'active' : ''}`}
                  >
                    {text}
                  </span>
                ))}
              </span>
            </div>
            
            <p className="hero-description">
              {t('hero.description')}
            </p>
            
            <div className="hero-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => scrollToSection('about')}
              >
                <span>{t('hero.buttons.knowMe')}</span>
                <div className="btn-effect"></div>
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={() => scrollToSection('portfolio')}
              >
                <span>{t('hero.buttons.viewWork')}</span>
                <div className="btn-effect"></div>
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="avatar-container">
              <div className="avatar">
                <div className="avatar-ring"></div>
                <div className="avatar-ring-2"></div>
                <div className="avatar-content">
                  <span className="avatar-text">DL</span>
                </div>
              </div>
            </div>
            
            <div className="floating-elements">
              <div className="element element-1">⚡</div>
              <div className="element element-2">🚀</div>
              <div className="element element-3">💡</div>
              <div className="element element-4">⭐</div>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <div className="scroll-arrow">
            <span>{t('hero.scrollText')}</span>
            <div className="arrow-down"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

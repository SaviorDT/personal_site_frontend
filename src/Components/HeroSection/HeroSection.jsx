import React, { useState, useEffect } from 'react';
import './HeroSection.css';

const HeroSection = () => {
  const [currentText, setCurrentText] = useState(0);
  const textArray = [
    "全端開發者",
    "創意思考者", 
    "技術愛好者",
    "問題解決者"
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
              <span className="greeting">Hello, 我是</span>
              <span className="name">SaviorDT</span>
            </h1>
            
            <div className="hero-subtitle">
              <span className="static-text">一位</span>
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
              熱衷於創造令人驚艷的數位體驗，專注於前端開發與使用者介面設計。
              讓我們一起探索技術的無限可能！
            </p>
            
            <div className="hero-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => scrollToSection('about')}
              >
                <span>認識我</span>
                <div className="btn-effect"></div>
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={() => scrollToSection('portfolio')}
              >
                <span>查看作品</span>
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
                  <span className="avatar-text">DT</span>
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
            <span>往下滑動探索更多</span>
            <div className="arrow-down"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

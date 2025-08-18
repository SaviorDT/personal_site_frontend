import React from 'react';
import './HeroSection.css';

/**
 * Hero 區域組件 - 頁面特有組件範例
 * 這個組件展示了頁面特有組件的設計模式
 * 
 * @param {Object} props - 組件屬性
 * @param {string} props.title - 主標題
 * @param {string} props.subtitle - 副標題
 * @param {Function} props.onAction - 動作回調
 * @param {boolean} props.isLoading - 載入狀態
 */
const HeroSection = ({
    title,
    subtitle,
    onAction,
    isLoading = false
}) => {
    return (
        <section className="hero-section">
            {/* 背景效果元素 */}
            <div className="hero-section__background">
                <div className="hero-section__glow"></div>
            </div>

            {/* 內容區域 */}
            <div className="hero-section__content">
                <header className="hero-section__header">
                    <h1 className="hero-section__title">
                        {title}
                        <span className="hero-section__title-glow"></span>
                    </h1>

                    {subtitle && (
                        <p className="hero-section__subtitle">
                            {subtitle}
                        </p>
                    )}
                </header>

                {/* 動作按鈕 */}
                {onAction && (
                    <div className="hero-section__actions">
                        <button
                            className={`hero-action-btn ${isLoading ? 'hero-action-btn--loading' : ''}`}
                            onClick={onAction}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="hero-action-btn__spinner"></span>
                                    處理中...
                                </>
                            ) : (
                                '開始探索'
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* 裝飾性元素 */}
            <div className="hero-section__decorations">
                <div className="hero-decoration hero-decoration--1"></div>
                <div className="hero-decoration hero-decoration--2"></div>
                <div className="hero-decoration hero-decoration--3"></div>
            </div>
        </section>
    );
};

export default HeroSection;

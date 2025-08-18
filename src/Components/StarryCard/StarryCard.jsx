import React, { useState, useEffect } from 'react';
import './StarryCard.css';

/**
 * 星空主題卡片組件 - 展示暗色系設計模式
 * 這個組件展示了我們的設計風格和組件結構約定
 * 
 * @param {Object} props - 組件屬性
 * @param {string} props.title - 卡片標題
 * @param {string} props.subtitle - 卡片副標題
 * @param {React.ReactNode} props.children - 卡片內容
 * @param {Function} props.onAction - 動作回調
 * @param {string} props.variant - 卡片變體 ('default', 'highlighted', 'interactive')
 * @param {string} props.className - 額外的 CSS 類名
 * @param {boolean} props.glowEffect - 是否啟用發光效果
 */
const StarryCard = ({
    title,
    subtitle,
    children,
    onAction,
    variant = 'default',
    className = '',
    glowEffect = false
}) => {
    // 狀態管理
    const [isHovered, setIsHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // 事件處理函數
    const handleMouseEnter = () => {
        setIsHovered(true);
        if (glowEffect) {
            setIsAnimating(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setIsAnimating(false);
    };

    const handleClick = () => {
        onAction?.();
        // 點擊動畫效果
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
    };

    // 計算CSS類名
    const cardClasses = [
        'starry-card',
        `starry-card--${variant}`,
        isHovered && 'starry-card--hovered',
        isAnimating && 'starry-card--animating',
        glowEffect && 'starry-card--glow',
        className
    ].filter(Boolean).join(' ');

    return (
        <article
            className={cardClasses}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            role={onAction ? 'button' : undefined}
            tabIndex={onAction ? 0 : undefined}
        >
            {/* 星空背景效果 */}
            <div className="starry-card__background">
                <div className="starry-card__stars"></div>
            </div>

            {/* 卡片內容 */}
            <div className="starry-card__content">
                {/* 標題區域 */}
                {(title || subtitle) && (
                    <header className="starry-card__header">
                        {title && (
                            <h3 className="starry-card__title">{title}</h3>
                        )}
                        {subtitle && (
                            <p className="starry-card__subtitle">{subtitle}</p>
                        )}
                    </header>
                )}

                {/* 主要內容 */}
                {children && (
                    <main className="starry-card__body">
                        {children}
                    </main>
                )}
            </div>

            {/* 邊框發光效果 */}
            {glowEffect && (
                <div className="starry-card__glow-border"></div>
            )}
        </article>
    );
};

export default StarryCard;

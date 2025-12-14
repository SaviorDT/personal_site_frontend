import React from 'react';
import './ComponentTemplate.css';

/**
 * 組件模板 - 展示標準組件結構
 * @param {Object} props - 組件屬性
 * @param {string} props.title - 組件標題
 * @param {React.ReactNode} props.children - 子組件
 * @param {Function} props.onAction - 動作回調函數
 * @param {string} props.className - 額外的 CSS 類名
 */
const ComponentTemplate = ({
    title,
    children,
    onAction,
    className = ''
}) => {
    // 組件內部狀態
    const [isActive, setIsActive] = React.useState(false);

    // 事件處理函數
    const handleClick = () => {
        setIsActive(!isActive);
        onAction?.();
    };

    // 計算 CSS 類名
    const containerClass = `component-template ${className} ${isActive ? 'active' : ''}`.trim();

    return (
        <div className={containerClass}>
            <div className="component-header">
                <h2 className="component-title">{title}</h2>
                <button
                    className="action-button"
                    onClick={handleClick}
                    aria-label="切換狀態"
                >
                    {isActive ? '激活' : '未激活'}
                </button>
            </div>

            <div className="component-content">
                {children}
            </div>
        </div>
    );
};

export default ComponentTemplate;

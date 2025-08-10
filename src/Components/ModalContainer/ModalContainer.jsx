import React from 'react';
import { createPortal } from 'react-dom';
import './ModalContainer.css';

/**
 * 全域 Modal 容器組件
 * 提供統一的模態視窗容器，處理覆蓋層、居中顯示和最上層顯示
 * 
 * @param {Object} props - 組件屬性
 * @param {boolean} props.isOpen - 是否顯示模態視窗
 * @param {function} props.onClose - 關閉模態視窗的回調函數
 * @param {React.ReactNode} props.children - 模態視窗內容
 * @param {string} props.size - 模態視窗大小 ('small', 'medium', 'large')
 * @param {boolean} props.closeOnOverlayClick - 點擊覆蓋層是否關閉模態視窗
 * @param {boolean} props.showCloseButton - 是否顯示關閉按鈕
 * @param {string} props.className - 額外的 CSS 類名
 * @param {boolean} props.animated - 是否啟用動畫效果
 */
const ModalContainer = ({
    isOpen = false,
    onClose,
    children,
    size = 'medium',
    closeOnOverlayClick = true,
    showCloseButton = true,
    className = '',
    animated = true
}) => {
    // 如果模態視窗未開啟，不渲染任何內容
    if (!isOpen) return null;

    // 處理覆蓋層點擊
    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose?.();
        }
    };

    // 處理關閉按鈕點擊
    const handleCloseClick = () => {
        onClose?.();
    };

    // 組合 CSS 類名
    const containerClass = [
        'modal-container-overlay',
        animated && 'modal-container-animated'
    ].filter(Boolean).join(' ');

    const modalClass = [
        'modal-container',
        `modal-container-${size}`,
        animated && 'modal-container-content-animated',
        className
    ].filter(Boolean).join(' ');

    // 獲取 Portal 目標容器
    const getPortalTarget = () => {
        // 嘗試獲取專用的 modal root
        let modalRoot = document.getElementById('modal-root');

        // 如果不存在，創建一個
        if (!modalRoot) {
            modalRoot = document.createElement('div');
            modalRoot.id = 'modal-root';
            modalRoot.style.position = 'relative';
            modalRoot.style.zIndex = '99999';
            document.body.appendChild(modalRoot);
        }

        return modalRoot;
    };

    // 使用 React Portal 渲染到 body 或專用容器
    const modalContent = (
        <div className={containerClass} onClick={handleOverlayClick}>
            <div className={modalClass} onClick={(e) => e.stopPropagation()}>
                {/* 關閉按鈕 */}
                {showCloseButton && onClose && (
                    <button
                        className="modal-container-close"
                        onClick={handleCloseClick}
                        aria-label="關閉模態視窗"
                    >
                        ×
                    </button>
                )}

                {/* 模態視窗內容 */}
                <div className="modal-container-content">
                    {children}
                </div>
            </div>
        </div>
    );

    // 使用 Portal 確保 Modal 渲染在 document.body 下
    return createPortal(modalContent, getPortalTarget());
};

export default ModalContainer;

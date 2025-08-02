import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './ImagePreview.css';

const ImagePreview = ({ src, alt, onImageClick }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = useCallback((e) => {
    // 只在桌面版顯示預覽
    if (window.innerWidth <= 768) return;
    
    const rect = e.target.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const previewWidth = viewportWidth * 0.5; // 設定為頁面寬度的 50%
    
    // 智能定位：根據圖片位置決定預覽顯示方向
    let x, y;
    
    if (rect.left < viewportWidth / 2) {
      // 圖片在左側，預覽顯示在右邊
      x = Math.min(rect.right + 20, viewportWidth - previewWidth - 20);
    } else {
      // 圖片在右側，預覽顯示在左邊
      x = Math.max(rect.left - previewWidth - 20, 20);
    }
    
    // 垂直位置，確保不超出視窗
    y = Math.max(rect.top - 50, 20);
    console.log(`Preview position set to: x=${x}, y=${y}`);
    
    setPreviewPosition({ x, y });
    setShowPreview(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowPreview(false);
  }, []);

  const handleClick = useCallback((e) => {
    e.preventDefault();
    onImageClick(src, alt);
  }, [src, alt, onImageClick]);

  const handleAuxClick = useCallback((e) => {
    // 中鍵點擊
    if (e.button === 1) {
      e.preventDefault();
      onImageClick(src, alt);
    }
  }, [src, alt, onImageClick]);

  return (
    <>
      <div className="milestone-image">
        <img 
          src={src} 
          alt={alt}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onAuxClick={handleAuxClick}
          style={{ cursor: 'pointer' }}
          title="點擊在新分頁開啟圖片"
        />
      </div>
      
      {showPreview && createPortal(
        <div 
          className="image-preview-popup"
          style={{
            position: 'fixed',
            left: `${previewPosition.x}px`,
            top: `${previewPosition.y}px`,
            zIndex: 9999,
          }}
        >
          <img src={src} alt={`${alt} - 預覽`} />
          <div className="preview-hint">點擊在新分頁開啟</div>
        </div>,
        document.body // 將預覽組件渲染到 body，避免父元素的 transform 影響
      )}
    </>
  );
};

export default ImagePreview;

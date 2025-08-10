# 個人網站開發風格指南

## 項目概述
這是一個基於 Vite + React 的個人網站項目，採用暗色系星空主題設計。

## 設計主題
- **主題風格**: 暗色系、星空、科技感
- **色調**: 深藍、深紫、星光藍、太空灰
- **視覺效果**: 漸變背景、模糊效果 (backdrop-filter)、發光效果

## 項目架構原則

### 文件結構
```
src/
├── Components/              # 全域通用組件
│   ├── Navigation/
│   ├── Layout/
│   ├── AuthModal/
│   └── ...
├── Pages/                   # 頁面組件
│   ├── Home/
│   │   ├── Components/      # 頁面特有組件
│   │   │   ├── HeroSection/
│   │   │   └── PreviewSections/
│   │   ├── Home.jsx
│   │   └── Home.css
│   ├── Portfolio/
│   │   ├── Components/
│   │   │   ├── PortfolioFilters/
│   │   │   └── ProjectCard/
│   │   ├── Portfolio.jsx
│   │   └── Portfolio.css
│   └── ...
├── hooks/                   # 自定義 Hooks
├── services/               # API 服務
├── contexts/               # React Context
└── config/                 # 配置文件
```

### 組件拆分原則
1. **單一職責**: 每個組件只負責一個功能
2. **可重用性**: 通用組件放在 `src/Components/`
3. **頁面特有**: 頁面專用組件放在 `src/Pages/{PageName}/Components/`
4. **獨立文件夾**: 每個組件都有自己的文件夾，包含 JSX 和 CSS

### 引用路徑
使用 Vite 的 `@` 別名，指向 `src/` 目錄：
```jsx
// ✅ 正確的引用方式
import Navigation from '@/Components/Navigation/Navigation';
import { useAuth } from '@/hooks/useAuth';
import HeroSection from './Components/HeroSection/HeroSection';

// ❌ 避免的引用方式
import Navigation from '../../Components/Navigation/Navigation';
```

## 編程風格

### React 組件結構
```jsx
import React, { useState, useEffect } from 'react';
import './ComponentName.css';
import { useCustomHook } from '@/hooks/useCustomHook';
import ChildComponent from './Components/ChildComponent/ChildComponent';

const ComponentName = ({ 
  title, 
  data, 
  onAction, 
  className = '' 
}) => {
  // 1. 狀態聲明
  const [isVisible, setIsVisible] = useState(false);
  
  // 2. 自定義 Hooks
  const { value, loading } = useCustomHook();
  
  // 3. 事件處理函數
  const handleToggle = () => {
    setIsVisible(!isVisible);
    onAction?.('toggle');
  };
  
  // 4. 副作用
  useEffect(() => {
    // 初始化邏輯
  }, []);
  
  // 5. 計算屬性
  const containerClass = `component-name ${className} ${isVisible ? 'visible' : ''}`.trim();
  
  return (
    <div className={containerClass}>
      <header className="component-header">
        <h2 className="component-title">{title}</h2>
      </header>
      <main className="component-content">
        <ChildComponent />
      </main>
    </div>
  );
};

export default ComponentName;
```

### CSS 風格
```css
/* 組件根類名與文件名對應 */
.component-name {
  background: linear-gradient(135deg, 
    rgba(26, 26, 46, 0.8), 
    rgba(15, 52, 96, 0.6)
  );
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  transition: all 0.3s ease;
}

/* 使用星空主題色彩 */
.component-title {
  color: #8fb3ff; /* 星光藍 */
  font-family: 'Orbitron', monospace;
}

/* hover 效果 */
.component-name:hover {
  border-color: rgba(143, 179, 255, 0.5);
  box-shadow: 0 4px 20px rgba(143, 179, 255, 0.2);
}
```

## 命名約定

### 組件命名
- **React 組件**: `PascalCase` (例: `HeroSection`, `ProjectCard`)
- **文件名**: 與組件名相同 (例: `HeroSection.jsx`)
- **CSS 類名**: `kebab-case` (例: `.hero-section`, `.project-card`)

### 函數命名
- **事件處理器**: `handle + 動作名` (例: `handleSubmit`, `handleToggle`)
- **API 函數**: `動詞 + 資源名` (例: `fetchProjects`, `updateProfile`)
- **工具函數**: `動詞 + 名詞` (例: `formatDate`, `validateEmail`)

### 變數命名
- **狀態變數**: 描述性命名 (例: `isLoading`, `currentUser`, `selectedProject`)
- **常量**: `UPPER_SNAKE_CASE` (例: `API_BASE_URL`, `STORAGE_KEYS`)

## Hook 使用模式

### 自定義 Hook 結構
```jsx
export const useFeatureName = (options = {}) => {
  const [state, setState] = useState(options.initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const actionFunction = useCallback(async (params) => {
    // 邏輯實現
  }, []);
  
  return {
    // 狀態
    state,
    loading,
    error,
    
    // 動作
    actionFunction,
    
    // 計算屬性
    isValid: Boolean(state)
  };
};
```

## 主題色彩系統
```css
:root {
  /* 主要顏色 */
  --color-primary: #8fb3ff;        /* 星光藍 */
  --color-secondary: #b8c5d6;      /* 月光銀 */
  --color-accent: #4a90e2;         /* 深空藍 */
  
  /* 背景顏色 */
  --bg-primary: rgba(12, 12, 12, 0.8);
  --bg-secondary: rgba(26, 26, 46, 0.6);
  --bg-card: linear-gradient(135deg, rgba(26, 26, 46, 0.6), rgba(22, 33, 62, 0.4));
  
  /* 邊框和陰影 */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-focus: rgba(143, 179, 255, 0.5);
  --shadow-glow: 0 4px 20px rgba(143, 179, 255, 0.2);
}
```

## 響應式設計
優先使用 CSS Grid 和 Flexbox，移動設備優先：
```css
/* 移動設備優先 */
.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* 平板設備 */
@media (min-width: 768px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

/* 桌面設備 */
@media (min-width: 1024px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 最佳實踐
1. 總是使用 `@` 路徑別名
2. 組件保持小而專注
3. 將複雜邏輯抽取到自定義 Hook
4. 使用一致的色彩和間距系統
5. 重視可訪問性 (aria-label, 語義化標籤)
6. 添加 loading 和 error 狀態

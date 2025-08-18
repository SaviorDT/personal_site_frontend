# 項目架構說明

## 項目概述
這是一個基於 **Vite + React** 的個人網站項目，採用**暗色系星空主題**設計風格。

## 🎨 設計理念
- **主題**: 暗色系、星空、科技感、未來感
- **色彩**: 深藍、深紫、星光藍 (#8fb3ff)、太空灰
- **效果**: 漸變背景、模糊效果 (backdrop-filter)、發光效果、動態星空

## 📁 目錄結構

```
src/
├── Components/              # 全域通用組件
│   ├── Navigation/          # 導航組件
│   ├── Layout/              # 佈局組件
│   ├── AuthModal/           # 認證彈窗
│   ├── StarryCard/          # 星空主題卡片
│   └── ComponentTemplate/   # 組件模板
│
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
│   └── Example/             # 範例頁面（展示架構）
│       ├── Components/
│       │   ├── HeroSection/
│       │   ├── ContentGrid/
│       │   └── ActionPanel/
│       ├── ExamplePage.jsx
│       └── ExamplePage.css
│
├── hooks/                   # 自定義 React Hooks
│   ├── usePageData.js       # 頁面數據管理
│   ├── usePlaylistManager.js # 播放清單管理
│   └── useHookTemplate.js   # Hook 模板
│
├── services/               # API 服務層
│   ├── authService.js
│   ├── articleService.js
│   └── portfolioService.js
│
├── contexts/               # React Context
│   └── AuthContext.jsx
│
├── data/                   # 靜態數據
│   ├── portfolio/
│   └── articles/
│
├── styles/                 # 全域樣式
│   └── theme.css           # 主題變數
│
├── config/                 # 配置文件
│   └── api.js
│
└── patterns/               # 編程模式範例
    └── ComponentPatterns.jsx
```

## 🎯 組件設計原則

### 1. 單一職責原則
每個組件只負責一個特定功能，保持簡潔和專注。

### 2. 組件分類
- **全域組件** (`src/Components/`): 整個應用通用的組件
- **頁面組件** (`src/Pages/{PageName}/`): 特定頁面的主組件
- **頁面子組件** (`src/Pages/{PageName}/Components/`): 頁面特有的子組件

### 3. 文件結構
每個組件都有獨立的文件夾，包含：
```
ComponentName/
├── ComponentName.jsx    # 組件邏輯
└── ComponentName.css    # 組件樣式
```

## 🔧 技術特色

### 1. 路徑別名 (@ 別名)
使用 Vite 的路徑別名功能，`@` 代表 `src/` 目錄：

```jsx
// ✅ 正確使用
import StarryCard from '@/Components/StarryCard/StarryCard';
import { usePageData } from '@/hooks/usePageData';
import HeroSection from './Components/HeroSection/HeroSection';

// ❌ 避免使用
import StarryCard from '../../Components/StarryCard/StarryCard';
```

### 2. 主題系統
使用 CSS 自定義屬性建立一致的設計系統：

```css
/* 使用主題變數 */
.my-component {
  color: var(--color-primary);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--ease-out);
}
```

### 3. 自定義 Hooks
將業務邏輯抽取到自定義 Hooks 中：

```jsx
const MyComponent = () => {
  const { data, loading, error, refetch } = usePageData();
  // 組件保持簡潔，專注於 UI 渲染
};
```

## 🎨 設計模式

### 1. 組件結構模式
```jsx
import React, { useState } from 'react';
import './ComponentName.css';
import { useCustomHook } from '@/hooks/useCustomHook';

const ComponentName = ({ title, onAction, className = '' }) => {
  // 1. 狀態聲明
  const [isActive, setIsActive] = useState(false);
  
  // 2. 自定義 Hooks
  const { data, loading } = useCustomHook();
  
  // 3. 事件處理函數
  const handleClick = () => {
    setIsActive(!isActive);
    onAction?.();
  };
  
  // 4. 計算屬性
  const containerClass = `component-name ${className} ${isActive ? 'active' : ''}`.trim();
  
  return (
    <div className={containerClass}>
      {/* JSX 內容 */}
    </div>
  );
};

export default ComponentName;
```

### 2. CSS 設計模式
```css
/* 基礎組件樣式 */
.component-name {
  /* 使用主題變數 */
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  
  /* 星空主題效果 */
  backdrop-filter: blur(15px);
  transition: all var(--duration-normal) var(--ease-out);
}

/* 狀態變體 */
.component-name--active {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-glow);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .component-name {
    padding: var(--spacing-4);
  }
}
```

## 🌟 星空主題特色

### 1. 色彩系統
- **主色**: `#8fb3ff` (星光藍)
- **輔助色**: `#b8c5d6` (月光銀)
- **強調色**: `#4a90e2` (深空藍)

### 2. 視覺效果
- **背景**: 深色漸變 + 星空動畫
- **卡片**: 半透明 + 模糊效果
- **邊框**: 微妙發光效果
- **按鈕**: 漸變 + 懸停動畫

### 3. 動畫效果
- 星空閃爍動畫
- 懸停發光效果
- 平滑過渡動畫
- 載入動畫

## 🚀 開發最佳實踐

1. **一致性**: 遵循命名約定和文件結構
2. **可重用性**: 優先考慮組件的可重用性
3. **性能**: 使用 React.memo、useCallback 等優化
4. **可訪問性**: 添加適當的 ARIA 屬性
5. **響應式**: 移動設備優先的設計
6. **主題**: 統一使用主題變數

## 📝 命名約定

- **組件**: `PascalCase` (如 `StarryCard`)
- **文件**: 與組件名相同 (如 `StarryCard.jsx`)
- **CSS 類**: `kebab-case` (如 `.starry-card`)
- **函數**: `camelCase` (如 `handleSubmit`)
- **常量**: `UPPER_SNAKE_CASE` (如 `API_BASE_URL`)
- **Hook**: `use` 前綴 (如 `usePageData`)

這個架構確保了代碼的可維護性、可擴展性和一致性，同時體現了星空暗色主題的設計理念。

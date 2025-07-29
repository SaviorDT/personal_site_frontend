# 文章系統使用指南

## 📝 如何新增文章

### 1. 創建文章資料夾
在 `src/data/articles/` 下創建新的資料夾，命名格式建議：
```
src/data/articles/[article-id]/
```

### 2. 創建文章組件
在新資料夾內創建 `[ArticleName].jsx` 文件：

```jsx
import React from 'react';
import './[ArticleName].css'; // 可選的樣式文件

// 文章 metadata - 必須導出
export const metadata = {
  id: 'article-id', // 唯一識別碼
  type: 'frontend', // 'frontend' 或 'backend'
  title: '文章標題',
  thumbnail: '/images/articles/thumbnail.svg',
  excerpt: '文章摘要...',
  author: 'Deeelol',
  publishDate: '2024-12-01',
  tags: ['標籤1', '標籤2'],
  category: '技術分享',
  readTime: 5,
  featured: false, // 可選
  difficulty: 'beginner', // 可選: beginner, intermediate, advanced
  lastModified: '2024-12-01' // 可選
};

// 文章組件 - 必須導出為 default
const [ArticleName] = () => {
  return (
    <article className="article-container">
      {/* 文章內容 */}
    </article>
  );
};

export default [ArticleName];
```

### 3. 創建樣式文件（可選）
在同一資料夾內創建 `[ArticleName].css`：

```css
/* 文章特定樣式 */
.custom-article-style {
  /* 你的樣式 */
}
```

### 4. 註冊文章
在 `src/data/articles/frontendArticles.js` 中：

```jsx
// 1. 導入 metadata
import { metadata as newArticleMetadata } from './new-article/NewArticle.jsx';

// 2. 加入 metadata 陣列
export const frontendArticles = [
  // 其他文章...
  newArticleMetadata,
];

// 3. 加入動態載入邏輯
export const loadArticleComponent = async (articleId) => {
  try {
    switch (articleId) {
      // 其他 case...
      case 'new-article-id':
        const { default: NewArticle } = await import('./new-article/NewArticle.jsx');
        return NewArticle;
      
      default:
        throw new Error(`Article component not found: ${articleId}`);
    }
  } catch (error) {
    console.error('Failed to load article component:', error);
    return null;
  }
};
```

### 5. 更新統一導出（可選）
在 `src/data/articles/index.js` 中加入新文章的 metadata 導出：

```jsx
export { metadata as newArticleMetadata } from './new-article/NewArticle.jsx';
```

## 🎨 樣式建議

### 使用基礎樣式
建議使用以下基礎 class 以保持一致性：

```css
.article-container {
  /* 基礎容器樣式 */
}

.article-header {
  /* 標題區域 */
}

.article-content {
  /* 內容區域 */
}

.article-section {
  /* 章節樣式 */
}
```

### 響應式設計
記得加入響應式支援：

```css
@media (max-width: 768px) {
  /* 手機版樣式 */
}
```

### 深色模式
支援深色模式：

```css
@media (prefers-color-scheme: dark) {
  /* 深色模式樣式 */
}
```

## 📊 Metadata 欄位說明

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| id | string | ✅ | 文章唯一識別碼，用於路由 |
| type | string | ✅ | 'frontend' 或 'backend' |
| title | string | ✅ | 文章標題 |
| thumbnail | string | ✅ | 縮圖路徑 |
| excerpt | string | ✅ | 文章摘要，用於預覽 |
| author | string | ✅ | 作者名稱 |
| publishDate | string | ✅ | 發布日期 (YYYY-MM-DD) |
| tags | array | ✅ | 標籤陣列，用於篩選 |
| category | string | ✅ | 分類名稱 |
| readTime | number | ✅ | 預估閱讀時間（分鐘） |
| featured | boolean | ❌ | 是否為精選文章 |
| difficulty | string | ❌ | 難度等級 |
| lastModified | string | ❌ | 最後修改日期 |

## 🔍 搜尋和篩選

文章系統支援以下搜尋和篩選功能：

- **關鍵字搜尋**：搜尋標題、摘要、內容和標籤
- **分類篩選**：根據 category 篩選
- **標籤篩選**：根據 tags 篩選
- **類型篩選**：frontend/backend 類型

## 🚀 最佳實踐

1. **ID 命名**：使用 kebab-case，例如：`react-vite-guide`
2. **圖片優化**：縮圖建議使用 WebP 格式，尺寸 400x200
3. **內容結構**：使用語義化的 HTML 標籤
4. **代碼示例**：使用 `<pre><code>` 標籤包裝程式碼
5. **SEO 友好**：確保 title 和 excerpt 具有描述性

## 📁 檔案結構範例

```
src/data/articles/
├── index.js                    # 統一導出
├── frontendArticles.js         # 文章註冊
├── react-vite-guide/           # 文章資料夾
│   ├── ReactViteGuide.jsx      # 文章組件
│   └── ReactViteGuide.css      # 文章樣式
└── new-article/                # 新文章
    ├── NewArticle.jsx
    └── NewArticle.css
```

這樣的架構讓每篇文章都是獨立的組件，便於管理和維護！

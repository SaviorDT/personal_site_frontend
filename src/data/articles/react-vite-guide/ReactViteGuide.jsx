import React from 'react';
import './ReactViteGuide.css';

// 文章 metadata
export const metadata = {
  id: 'react-vite-guide',
  type: 'frontend',
  title: '如何用 React 和 Vite 建立現代化前端專案',
  thumbnail: '/images/articles/react-vite-thumbnail.svg',
  excerpt: '在現代前端開發中，React 配合 Vite 已經成為許多開發者的首選組合。本文將詳細介紹如何從零開始建立一個現代化的前端專案，包含最佳實踐和實用技巧。',
  author: 'Deeelol',
  publishDate: '2024-12-01',
  tags: ['React', 'Vite', '前端開發', 'JavaScript', '工具鏈'],
  category: '技術分享',
  readTime: 8,
  featured: true, // 是否為精選文章
  difficulty: 'intermediate', // 難度: beginner, intermediate, advanced
  lastModified: '2024-12-01'
};

// 文章組件
const ReactViteGuide = () => {
  return (
    <>
      <section className="article-intro">
        <p className="lead-paragraph">
          在現代前端開發中，React 配合 Vite 已經成為許多開發者的首選組合。
          Vite 提供了極快的開發體驗，而 React 則給我們強大的組件化開發能力。
          本文將從實戰角度，帶你一步步建立一個現代化的前端專案。
        </p>
      </section>

      <section className="article-section">
        <h2>為什麼選擇 Vite？</h2>
        <p>Vite 相比傳統的 webpack 有以下顯著優勢：</p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <h3>⚡ 極快的冷啟動</h3>
            <p>利用 ES modules 的原生支持，啟動速度比 webpack 快 10-100 倍</p>
          </div>
          <div className="feature-card">
            <h3>🔥 即時熱重載</h3>
            <p>修改代碼後幾乎即時看到效果，無需等待重新編譯</p>
          </div>
          <div className="feature-card">
            <h3>📦 按需編譯</h3>
            <p>只編譯當前需要的模塊，大大提升開發效率</p>
          </div>
          <div className="feature-card">
            <h3>🔌 豐富的插件生態</h3>
            <p>支持各種框架和工具，擴展性極強</p>
          </div>
        </div>
      </section>

      <section className="article-section">
        <h2>開始建立專案</h2>
        <p>首先，我們可以使用 Vite 的官方模板來建立 React 專案：</p>
        
        <div className="code-block">
          <div className="code-header">
            <span className="code-language">bash</span>
            <button className="copy-btn">複製</button>
          </div>
          <pre><code>{`npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev`}</code></pre>
        </div>
        
        <div className="tip-box">
          <strong>💡 提示：</strong>
          你也可以選擇 TypeScript 模板：<code>--template react-ts</code>
        </div>
      </section>

      <section className="article-section">
        <h2>項目結構優化</h2>
        <p>一個好的項目結構是成功的一半。以下是我推薦的目錄結構：</p>
        
        <div className="file-tree">
          <div className="file-tree-item folder">src/</div>
          <div className="file-tree-item file indent-1">components/ <span className="comment"># 可重用組件</span></div>
          <div className="file-tree-item file indent-1">pages/ <span className="comment"># 頁面組件</span></div>
          <div className="file-tree-item file indent-1">hooks/ <span className="comment"># 自定義 hooks</span></div>
          <div className="file-tree-item file indent-1">utils/ <span className="comment"># 工具函數</span></div>
          <div className="file-tree-item file indent-1">services/ <span className="comment"># API 服務</span></div>
          <div className="file-tree-item file indent-1">contexts/ <span className="comment"># React Context</span></div>
          <div className="file-tree-item file indent-1">assets/ <span className="comment"># 靜態資源</span></div>
        </div>
      </section>

      <section className="article-section">
        <h2>添加必要的依賴</h2>
        <p>根據專案需求，我們通常會添加以下依賴：</p>
        
        <div className="dependencies-grid">
          <div className="dependency-card">
            <h3>🧭 路由管理</h3>
            <code>npm install react-router-dom</code>
            <p>用於單頁應用的路由管理</p>
          </div>
          <div className="dependency-card">
            <h3>📊 狀態管理</h3>
            <code>npm install zustand</code>
            <p>輕量級的狀態管理解決方案</p>
          </div>
          <div className="dependency-card">
            <h3>🎨 UI 框架</h3>
            <code>npm install @mui/material</code>
            <p>Material Design 組件庫</p>
          </div>
          <div className="dependency-card">
            <h3>🌐 HTTP 客戶端</h3>
            <code>npm install axios</code>
            <p>功能強大的 HTTP 請求庫</p>
          </div>
        </div>
      </section>

      <section className="article-section">
        <h2>配置開發環境</h2>
        <p>在 <code>vite.config.js</code> 中，我們可以配置路徑別名來簡化導入：</p>
        
        <div className="code-block">
          <div className="code-header">
            <span className="code-language">javascript</span>
            <button className="copy-btn">複製</button>
          </div>
          <pre><code>{`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true
  }
})`}</code></pre>
        </div>
      </section>

      <section className="article-section">
        <h2>最佳實踐</h2>
        <div className="best-practices">
          <div className="practice-item">
            <h3>1. 使用 TypeScript</h3>
            <p>提供更好的開發體驗和類型安全</p>
          </div>
          <div className="practice-item">
            <h3>2. 代碼分割</h3>
            <p>使用 React.lazy 進行懶加載，優化應用性能</p>
          </div>
          <div className="practice-item">
            <h3>3. 環境變量</h3>
            <p>合理使用 .env 文件管理不同環境的配置</p>
          </div>
          <div className="practice-item">
            <h3>4. 代碼格式化</h3>
            <p>配置 ESLint 和 Prettier 保持代碼品質</p>
          </div>
        </div>
      </section>

      <section className="article-conclusion">
        <h2>總結</h2>
        <p>
          通過本文的介紹，我們已經完成了一個現代化的 React + Vite 專案搭建。
          這個組合不僅提供了出色的開發體驗，還為我們的應用奠定了良好的基礎。
          接下來你就可以開始開發你的應用了！
        </p>
        
        <div className="call-to-action">
          <p>如果這篇文章對你有幫助，歡迎分享給更多的開發者！</p>
        </div>
      </section>
    </>
  );
};

export default ReactViteGuide;

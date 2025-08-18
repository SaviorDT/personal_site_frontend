import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '@/Components/Layout/Layout';
import Home from '@/Pages/Home/Home';
import Articles from '@/Pages/Articles/Articles';
import ArticleDetail from '@/Pages/ArticleDetail/ArticleDetail';
import Portfolio from '@/Pages/Portfolio/Portfolio';
import ProjectDetail from '@/Pages/ProjectDetail/ProjectDetail';

// 路由配置
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "首頁",
        element: <Navigate to="/" replace />
      },
      {
        path: "文章",
        element: <Articles />
      },
      {
        path: "文章/:articleId",
        element: <ArticleDetail />
      },
      {
        path: "關於",
        element: <div className="page-placeholder">關於頁面 - 開發中</div>
      },
      {
        path: "作品集",
        element: <Portfolio />
      },
      {
        path: "作品集/:projectId",
        element: <ProjectDetail />
      },
      {
        path: "聯絡",
        element: <div className="page-placeholder">聯絡頁面 - 開發中</div>
      },
      // 404 頁面
      {
        path: "*",
        element: <div className="page-placeholder">404 - 頁面未找到</div>
      }
    ]
  }
]);

// 導出路由路徑常量，方便其他組件使用
export const ROUTES = {
  HOME: '/',
  ARTICLES: '/文章',
  ARTICLE_DETAIL: '/文章/:articleId',
  ABOUT: '/關於',
  PORTFOLIO: '/作品集',
  PROJECT_DETAIL: '/作品集/:projectId',
  CONTACT: '/聯絡'
};

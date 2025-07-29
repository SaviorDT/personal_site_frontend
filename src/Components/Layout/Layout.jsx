import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '@/Components/Navigation/Navigation';
import AnimatedBackground from '@/Components/AnimatedBackground/AnimatedBackground';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      {/* 動畫背景 */}
      <AnimatedBackground />
      
      {/* 導航欄 */}
      <Navigation />
      
      {/* 主要內容區域 */}
      <main className="main-content">
        <Outlet />
      </main>
      
      {/* 可以在這裡添加 Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;

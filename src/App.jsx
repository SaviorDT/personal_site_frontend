import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/Components/AuthModal/AuthModal';
import { router } from '@/router';
import './App.css';

// 內部組件來處理事件監聽和全局 AuthModal
const AppContent = () => {
  const { authModalOpen, authMode, closeAuthModal, showAuthModalIfNotVisible } = useAuth();

  useEffect(() => {
    // 監聽來自 authService 的事件
    const handleShowAuthModal = (event) => {
      const { mode = 'login' } = event.detail || {};
      showAuthModalIfNotVisible(mode);
    };

    window.addEventListener('show-auth-modal', handleShowAuthModal);
    
    return () => {
      window.removeEventListener('show-auth-modal', handleShowAuthModal);
    };
  }, [showAuthModalIfNotVisible]);

  return (
    <>
      {/* React Router 路由 */}
      <RouterProvider router={router} />
      
      {/* 全局 AuthModal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authMode}
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/Components/AuthModal/AuthModal';
import Home from '@/Pages/Home/Home';
import './App.css';

// 內部組件來處理事件監聽
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
    <div className="App">
      <Home />
      {/* 全局 AuthModal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authMode}
      />
    </div>
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

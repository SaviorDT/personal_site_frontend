import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '@/services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初始化時檢查登入狀態
  useEffect(() => {
    checkAuthStatus();

    // 監聽登出事件
    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    // 監聽登入成功事件
    const handleLoginSuccess = (event) => {
      const userData = event.detail;
      updateUserStatus(userData);
    };

    window.addEventListener('auth-logout', handleLogout);
    window.addEventListener('auth-login-success', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('auth-logout', handleLogout);
      window.removeEventListener('auth-login-success', handleLoginSuccess);
    };
  }, []);

  // 監聽用戶數據變化
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    // 重新檢查登入狀態（用戶可能在 modal 中登入了）
    checkAuthStatus();
  };

  const showAuthModalIfNotVisible = (mode = 'login') => {
    // 只有在 modal 沒有打開時才顯示
    if (!authModalOpen) {
      openAuthModal(mode);
    }
  };

  const checkAuthStatus = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUserStatus = (userData) => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
  };

  const value = {
    authModalOpen,
    authMode,
    openAuthModal,
    closeAuthModal,
    showAuthModalIfNotVisible,
    user,
    isAuthenticated,
    logout,
    updateUserStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

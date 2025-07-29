import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LanguageDropdown from '@/Components/LanguageDropdown/LanguageDropdown';
import { ROUTES } from '@/router';
import './Navigation.css';

const Navigation = () => {
  const { t } = useTranslation();
  const { openAuthModal, user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: t('nav.home'), path: ROUTES.HOME, icon: '🏠' },
    { name: t('nav.about'), path: ROUTES.ABOUT, icon: '👤' },
    { name: t('nav.articles'), path: ROUTES.ARTICLES, icon: '📝' },
    { name: t('nav.portfolio'), path: ROUTES.PORTFOLIO, icon: '💼' },
    { name: t('nav.contact'), path: ROUTES.CONTACT, icon: '📧' },
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  // 縮短用戶名稱的函數
  const getDisplayName = (nickname) => {
    if (!nickname) return t('nav.account');
    if (nickname.length <= 8) return nickname;
    return nickname.substring(0, 6) + '...';
  };

  // 點擊外部關閉用戶選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <nav className={`navigation ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <span className="logo-text">Deeelol</span>
          <div className="logo-effect"></div>
        </div>

        <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          {navItems.map((item, index) => (
            <li key={index} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
                <div className="nav-highlight"></div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <LanguageDropdown />
          
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button 
                className="auth-btn unified-auth-btn user-btn"
                onClick={toggleUserMenu}
                title={user?.nickname || t('nav.account')}
              >
                <span className="auth-icon">👤</span>
                <span className="auth-text">{getDisplayName(user?.nickname)}</span>
                <span className={`dropdown-arrow ${userMenuOpen ? 'open' : ''}`}>▼</span>
              </button>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-name">{user?.nickname}</div>
                    <div className="user-role">{user?.role || 'User'}</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">🚪</span>
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="auth-btn unified-auth-btn"
              onClick={() => openAuthModal('login')}
            >
              <span className="auth-icon">👤</span>
              <span className="auth-text">{t('nav.account')}</span>
            </button>
          )}
          
          <div className="nav-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

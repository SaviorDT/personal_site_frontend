import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageDropdown from 'Components/LanguageDropdown/LanguageDropdown';
import AuthModal from 'Components/AuthModal/AuthModal';
import './Navigation.css';

const Navigation = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: t('nav.home'), href: '#home', icon: '🏠' },
    { name: t('nav.about'), href: '#about', icon: '👤' },
    { name: t('nav.articles'), href: '#articles', icon: '📝' },
    { name: t('nav.portfolio'), href: '#portfolio', icon: '💼' },
    { name: t('nav.contact'), href: '#contact', icon: '📧' },
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

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
              <a href={item.href} className="nav-link">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
                <div className="nav-highlight"></div>
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <LanguageDropdown />
          <button 
            className="auth-btn unified-auth-btn"
            onClick={() => openAuthModal('login')}
          >
            <span className="auth-icon">👤</span>
            <span className="auth-text">{t('nav.account')}</span>
          </button>
          <div className="nav-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authMode}
      />
    </nav>
  );
};

export default Navigation;

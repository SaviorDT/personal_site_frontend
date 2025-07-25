import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from 'Components/LanguageSwitch/LanguageSwitch';
import './Navigation.css';

const Navigation = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          <LanguageSwitch />
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

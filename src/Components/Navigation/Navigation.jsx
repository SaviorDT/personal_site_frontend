import React, { useState, useEffect } from 'react';
import './Navigation.css';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: '首頁', href: '#home', icon: '🏠' },
    { name: '關於我', href: '#about', icon: '👤' },
    { name: '文章', href: '#articles', icon: '📝' },
    { name: '作品集', href: '#portfolio', icon: '💼' },
    { name: '聯絡', href: '#contact', icon: '📧' },
  ];

  return (
    <nav className={`navigation ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <span className="logo-text">SaviorDT</span>
          <div className="logo-effect"></div>
        </div>
        
        <ul className="nav-menu">
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

        <div className="nav-toggle">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitch.css';

const LanguageSwitch = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'zh', name: '中文', flag: '🇹🇼' },
    { code: 'en', name: 'EN', flag: '🇺🇸' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switch">
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
          onClick={() => changeLanguage(lang.code)}
          title={`Switch to ${lang.name}`}
        >
          <span className="lang-flag">{lang.flag}</span>
          <span className="lang-name">{lang.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitch;

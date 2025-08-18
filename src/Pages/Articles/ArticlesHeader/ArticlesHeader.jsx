import React from 'react';
import { useTranslation } from 'react-i18next';
import './ArticlesHeader.css';

const ArticlesHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="articles-header">
      <h1 className="articles-title">{t('articles.title', '文章分享')}</h1>
      <p className="articles-subtitle">
        {t('articles.subtitle', '分享程式心得以及日常生活')}
      </p>
    </div>
  );
};

export default ArticlesHeader;

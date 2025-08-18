import React from 'react';
import { useTranslation } from 'react-i18next';
import './ArticlesStats.css';

const ArticlesStats = ({ loading, total }) => {
  const { t } = useTranslation();

  return (
    <div className="articles-stats">
      <span className="stats-text">
        {loading ? 
          t('articles.loading', '載入中...') : 
          t('articles.found', '找到 {{count}} 篇文章', { count: total })
        }
      </span>
    </div>
  );
};

export default ArticlesStats;

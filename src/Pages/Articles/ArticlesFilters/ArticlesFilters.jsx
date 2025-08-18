import React from 'react';
import { useTranslation } from 'react-i18next';
import './ArticlesFilters.css';

const ArticlesFilters = ({
  filters,
  categories,
  popularTags,
  onFilterChange,
  onSearch,
  onClearFilters
}) => {
  const { t } = useTranslation();

  return (
    <div className="articles-filters">
      
      {/* 搜尋框 */}
      <div className="search-box">
        <input
          type="text"
          placeholder={t('articles.search.placeholder', '搜尋文章...')}
          value={filters.search}
          onChange={(e) => onSearch(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* 類別篩選 */}
      <div className="filter-group">
        <label className="filter-label">
          {t('articles.filter.category', '類別')}
        </label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="filter-select"
        >
          <option value="">{t('articles.filter.all', '全部')}</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* 熱門標籤 */}
      <div className="filter-group">
        <label className="filter-label">
          {t('articles.filter.tags', '熱門標籤')}
        </label>
        <div className="tag-filters">
          {popularTags.slice(0, 8).map(tag => (
            <button
              key={tag.name}
              className={`tag-filter ${filters.tag === tag.name ? 'active' : ''}`}
              onClick={() => onFilterChange('tag', filters.tag === tag.name ? '' : tag.name)}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* 清除篩選按鈕 */}
      {(filters.category || filters.tag || filters.search) && (
        <button className="clear-filters-btn" onClick={onClearFilters}>
          <span className="clear-icon">✕</span>
          {t('articles.filter.clear', '清除篩選')}
        </button>
      )}
    </div>
  );
};

export default ArticlesFilters;

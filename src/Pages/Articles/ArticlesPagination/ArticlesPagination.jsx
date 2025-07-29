import React from 'react';
import { useTranslation } from 'react-i18next';
import './ArticlesPagination.css';

const ArticlesPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="articles-pagination">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← {t('pagination.prev', '上一頁')}
      </button>
      
      <div className="pagination-numbers">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          );
        })}
        {totalPages > 5 && (
          <>
            <span className="pagination-ellipsis">...</span>
            <button
              className="pagination-number"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {t('pagination.next', '下一頁')} →
      </button>
    </div>
  );
};

export default ArticlesPagination;

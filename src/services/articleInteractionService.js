// 文章互動服務
class ArticleInteractionService {
  // 獲取文章喜歡數量（未實作，返回默認值）
  async getLikeCount(articleId) {
    // TODO: 實作後端 API 調用
    console.log(`Getting like count for article: ${articleId}`);
    
    // 默認值
    const defaultCounts = {
      'react-vite-guide': 0,
      // 可以為其他文章添加默認值
    };
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(defaultCounts[articleId] || 0);
      }, 500);
    });
  }

  // 切換文章喜歡狀態（未實作）
  async toggleLike(articleId) {
    // TODO: 實作後端 API 調用
    console.log(`Toggling like for article: ${articleId}`);
    throw new Error('功能未實作');
  }

  // 複製文章網址到剪貼板
  async copyArticleUrl(articleId) {
    try {
      const currentUrl = window.location.origin;
      const articleUrl = `${currentUrl}/文章/${articleId}`;
      
      if (navigator.clipboard && window.isSecureContext) {
        // 使用現代 Clipboard API
        await navigator.clipboard.writeText(articleUrl);
      } else {
        // 後備方案：使用 execCommand（已棄用但仍然有效）
        const textArea = document.createElement('textarea');
        textArea.value = articleUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      return articleUrl;
    } catch (error) {
      console.error('複製到剪貼板失敗:', error);
      throw new Error('複製失敗，請手動複製網址');
    }
  }

  // 收藏文章（未實作）
  async bookmarkArticle(articleId) {
    // TODO: 實作後端 API 調用
    console.log(`Bookmarking article: ${articleId}`);
    throw new Error('收藏功能尚未實作，敬請期待！');
  }

  // 顯示通知
  showNotification(message, type = 'info') {
    // 移除現有通知
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // 簡單的通知實作
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 檢查深色模式
    const isVisible = entry.isIntersecting;
    
    // 使用統一的深色模式設計，不再偵測系統設定
    const isDarkMode = true; // 統一使用深色模式
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, ${isDarkMode ? '0.3' : '0.15'});
      z-index: 9999;
      font-weight: 500;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      border: ${isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
    `;

    // 添加動畫（只添加一次）
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // 3秒後自動移除
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

export default new ArticleInteractionService();

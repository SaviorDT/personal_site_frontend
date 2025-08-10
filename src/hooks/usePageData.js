import { useState, useEffect, useCallback } from 'react';

/**
 * 頁面數據管理 Hook - 展示自定義 Hook 模式
 * 
 * 這個 Hook 展示了：
 * 1. 數據獲取和狀態管理
 * 2. 錯誤處理
 * 3. 載入狀態
 * 4. 記憶化函數
 * 5. 清理邏輯
 * 
 * @param {Object} options - Hook 配置選項
 * @param {boolean} options.autoFetch - 是否自動獲取數據
 * @param {number} options.refreshInterval - 自動刷新間隔（毫秒）
 * @returns {Object} Hook 返回值
 */
export const usePageData = ({
    autoFetch = true,
    refreshInterval = 0
} = {}) => {
    // 狀態管理
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(null);

    // 模擬 API 數據獲取
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 模擬網路請求延遲
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 模擬數據
            const mockData = {
                items: [
                    {
                        id: '1',
                        title: '星空項目 1',
                        description: '這是一個展示暗色系設計的項目',
                        category: 'frontend',
                        featured: true,
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: '2',
                        title: '宇宙主題應用',
                        description: '探索深空的互動式體驗',
                        category: 'fullstack',
                        featured: false,
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: '3',
                        title: '星際導航系統',
                        description: '基於 React 的導航組件庫',
                        category: 'component',
                        featured: true,
                        timestamp: new Date().toISOString()
                    }
                ],
                pagination: {
                    total: 3,
                    page: 1,
                    pageSize: 10
                },
                meta: {
                    fetchTime: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            // 模擬可能的錯誤
            if (Math.random() < 0.1) {
                throw new Error('網路連接失敗');
            }

            setData(mockData);
            setLastFetchTime(new Date());

            console.log('數據獲取成功:', mockData);

        } catch (err) {
            setError(err.message || '數據獲取失敗');
            console.error('數據獲取錯誤:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 重新獲取數據
    const refetch = useCallback(() => {
        return fetchData();
    }, [fetchData]);

    // 清除錯誤
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // 重置所有狀態
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
        setLastFetchTime(null);
    }, []);

    // 根據條件過濾數據
    const getFilteredData = useCallback((filter = 'all') => {
        if (!data || !data.items) return [];

        if (filter === 'all') return data.items;
        if (filter === 'featured') return data.items.filter(item => item.featured);

        return data.items.filter(item => item.category === filter);
    }, [data]);

    // 自動獲取數據
    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData]);

    // 自動刷新功能
    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(() => {
                console.log('自動刷新數據...');
                fetchData();
            }, refreshInterval);

            return () => clearInterval(interval);
        }
    }, [refreshInterval, fetchData]);

    // 計算衍生狀態
    const derivedState = {
        hasData: Boolean(data && data.items && data.items.length > 0),
        isEmpty: Boolean(data && data.items && data.items.length === 0),
        itemCount: data?.items?.length || 0,
        featuredCount: data?.items?.filter(item => item.featured).length || 0,
        isStale: lastFetchTime ? (Date.now() - lastFetchTime.getTime()) > 300000 : false, // 5分鐘
        canRefresh: !loading
    };

    // 返回 Hook 接口
    return {
        // 主要數據
        data,
        loading,
        error,
        lastFetchTime,

        // 動作函數
        refetch,
        clearError,
        reset,
        getFilteredData,

        // 衍生狀態
        ...derivedState,

        // 工具函數
        utils: {
            isItemFeatured: (itemId) => {
                return data?.items?.find(item => item.id === itemId)?.featured || false;
            },
            getItemsByCategory: (category) => {
                return data?.items?.filter(item => item.category === category) || [];
            },
            getItemById: (itemId) => {
                return data?.items?.find(item => item.id === itemId) || null;
            }
        }
    };
};

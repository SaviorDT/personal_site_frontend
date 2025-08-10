import { useState, useEffect, useCallback } from 'react';

/**
 * 自定義 Hook 模板
 * 展示標準 Hook 結構和最佳實踐
 * 
 * @param {Object} options - Hook 配置選項
 * @param {string} options.initialValue - 初始值
 * @param {Function} options.onUpdate - 更新回調
 * @returns {Object} Hook 返回值
 */
export const useHookTemplate = ({
    initialValue = '',
    onUpdate
} = {}) => {
    // 狀態定義
    const [value, setValue] = useState(initialValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 使用 useCallback 優化函數引用
    const updateValue = useCallback(async (newValue) => {
        try {
            setLoading(true);
            setError(null);

            // 模擬異步操作
            await new Promise(resolve => setTimeout(resolve, 1000));

            setValue(newValue);
            onUpdate?.(newValue);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [onUpdate]);

    // 重置函數
    const reset = useCallback(() => {
        setValue(initialValue);
        setError(null);
    }, [initialValue]);

    // 副作用處理
    useEffect(() => {
        // 組件掛載時的初始化邏輯
        console.log('Hook initialized with value:', initialValue);

        // 清理函數
        return () => {
            console.log('Hook cleanup');
        };
    }, [initialValue]);

    // 返回 Hook 的公共接口
    return {
        // 狀態
        value,
        loading,
        error,

        // 動作
        updateValue,
        reset,

        // 計算屬性
        hasValue: Boolean(value),
        isValid: value.length >= 3
    };
};

/**
 * 項目特定的編程約定和模式
 * 這個文件幫助 GitHub Copilot 理解我們的編程風格
 */

// ========== 組件導入模式 ==========
// 總是先導入 React，然後是樣式文件，最後是其他依賴
import React, { useState, useEffect } from 'react';
import './ComponentName.css';
import CustomHook from '@/hooks/useCustomHook';

// ========== 組件結構模式 ==========
// 1. Props 解構
// 2. 狀態聲明
// 3. 自定義 Hook
// 4. 事件處理函數
// 5. 副作用
// 6. 渲染邏輯

const ExampleComponent = ({
    title,
    data,
    onAction,
    className = ''
}) => {
    // 狀態聲明
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // 自定義 Hook
    const { value, updateValue } = CustomHook();

    // 事件處理函數 - 使用 handle 前綴
    const handleToggle = () => {
        setIsVisible(!isVisible);
        onAction?.('toggle');
    };

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await submitData(formData);
        } catch (error) {
            console.error('提交失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    // 副作用
    useEffect(() => {
        // 初始化邏輯
        return () => {
            // 清理邏輯
        };
    }, []);

    // 計算屬性
    const containerClass = `example-component ${className} ${isVisible ? 'visible' : ''}`.trim();

    return (
        <div className={containerClass}>
            <header className="component-header">
                <h2 className="component-title">{title}</h2>
            </header>
            <main className="component-content">
                {/* 內容 */}
            </main>
        </div>
    );
};

// ========== CSS 類名約定 ==========
// 使用 BEM 風格的類名
// .component-name
// .component-name__element
// .component-name--modifier

// ========== 函數命名約定 ==========
// 事件處理器: handle + 動作名
// API 調用: fetch/get/post/put/delete + 資源名
// 工具函數: 動詞 + 名詞

// ========== 狀態管理模式 ==========
// 簡單狀態: useState
// 複雜狀態: useReducer 或自定義 Hook
// 全局狀態: Context API

export default ExampleComponent;

import React, { useState } from 'react';
import './ExamplePage.css';
import HeroSection from './Components/HeroSection/HeroSection';
import ContentGrid from './Components/ContentGrid/ContentGrid';
import ActionPanel from './Components/ActionPanel/ActionPanel';
import StarryCard from '@/Components/StarryCard/StarryCard';
import { usePageData } from '@/hooks/usePageData';

/**
 * 範例頁面 - 展示頁面級組件架構
 * 
 * 這個頁面展示了：
 * 1. 頁面組件的結構模式
 * 2. 如何組合全域和頁面特有組件
 * 3. 如何使用 @ 路徑別名
 * 4. 星空暗色主題的應用
 */
const ExamplePage = () => {
    // 頁面狀態
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    // 自定義 Hook 使用
    const { data, error, refetch } = usePageData();

    // 事件處理函數
    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        // 可能觸發數據重新載入
    };

    const handleAction = async (actionType) => {
        setIsLoading(true);
        try {
            // 執行動作
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`執行動作: ${actionType}`);
        } catch (error) {
            console.error('動作執行失敗:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardClick = (cardId) => {
        console.log(`點擊卡片: ${cardId}`);
        // 導航或其他邏輯
    };

    return (
        <div className="example-page">
            {/* 頁面背景效果 */}
            <div className="example-page__background">
                <div className="example-page__stars"></div>
            </div>

            {/* 頁面內容 */}
            <div className="example-page__content">
                {/* Hero 區域 - 頁面特有組件 */}
                <HeroSection
                    title="範例頁面"
                    subtitle="展示星空主題和組件架構"
                    onAction={() => handleAction('hero')}
                    isLoading={isLoading}
                />

                {/* 動作面板 - 頁面特有組件 */}
                <ActionPanel
                    selectedFilter={selectedFilter}
                    onFilterChange={handleFilterChange}
                    onRefresh={refetch}
                    isLoading={isLoading}
                />

                {/* 內容網格 - 頁面特有組件 */}
                <ContentGrid
                    data={data}
                    filter={selectedFilter}
                    isLoading={isLoading}
                    error={error}
                    onItemClick={handleCardClick}
                />

                {/* 使用全域組件的範例 */}
                <section className="example-page__cards">
                    <div className="example-page__cards-grid">
                        <StarryCard
                            title="全域組件範例"
                            subtitle="這是來自 @/Components 的通用組件"
                            variant="highlighted"
                            glowEffect={true}
                            onAction={() => handleCardClick('global-card-1')}
                        >
                            <p>
                                這個卡片展示了如何使用全域的 StarryCard 組件，
                                它可以在整個應用中重複使用。
                            </p>
                        </StarryCard>

                        <StarryCard
                            title="互動式卡片"
                            subtitle="支持懸停和點擊效果"
                            variant="interactive"
                            onAction={() => handleCardClick('interactive-card')}
                        >
                            <div className="card-content">
                                <p>暗色系設計配合星空效果</p>
                                <ul>
                                    <li>漸變背景</li>
                                    <li>模糊效果</li>
                                    <li>發光邊框</li>
                                    <li>平滑動畫</li>
                                </ul>
                            </div>
                        </StarryCard>

                        <StarryCard
                            title="響應式設計"
                            subtitle="適配各種螢幕尺寸"
                            glowEffect={false}
                        >
                            <p>
                                組件設計考慮了移動設備優先的響應式原則，
                                在不同尺寸的螢幕上都能提供良好的用戶體驗。
                            </p>
                        </StarryCard>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ExamplePage;

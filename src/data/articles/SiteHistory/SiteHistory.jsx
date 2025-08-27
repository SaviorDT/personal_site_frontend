import React from 'react';
import './SiteHistory.css';
import uploadImage from './Images/upload.png';
import dockerImage from './Images/docker.png';
import domainImage from './Images/domain.png';
import loginImage from './Images/login.png';
import homeImage from './Images/home.png';
import ImagePreview from '@/Components/ImagePreview/ImagePreview';

// 文章組件
const SiteHistory = () => {
  // 處理圖片點擊，在新分頁開啟
  const handleImageClick = (src, alt) => {
    window.open(src, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* 極光背景 - 多層效果 */}
      <div className="aurora-background">
        <div className="aurora-layer-tertiary"></div>
        <div className="aurora-particles"></div>
      </div>

      <section className="article-intro">
        <p className="lead-paragraph">
          每個網站背後都有屬於它的故事。從第一行程式碼的誕生，到如今的成果，
          這段旅程見證了技術的成長與夢想的實現。讓我們一起走過這些珍貴的里程碑，
          回顧那些充滿挑戰與收穫的美好時光。
        </p>
      </section>

      <section className="journey-timeline">
        <div className="timeline-path">

          {/* 節點 1 - 左側 */}
          <div className="milestone left">
            <div className="milestone-date">2021</div>
            <div className="milestone-content">
              <ImagePreview
                src={uploadImage}
                alt="舊網站圖片"
                onImageClick={handleImageClick}
              />
              <h3>🌱 萌芽起步</h3>
              <p>在簡恩生的帶領下，踏出了網頁開發的第一步</p>
              <p>使用 XAMPP 環境，純手工打造 HTML、JavaScript 與 CSS</p>
              <p>雖然介面簡樸，但這個小小的線上工具庫承載著最初的夢想</p>
            </div>
          </div>

          {/* 節點 2 - 右側 */}
          <div className="milestone right">
            <div className="milestone-date">2025.02</div>
            <div className="milestone-content">
              <ImagePreview
                src={dockerImage}
                alt="docker 圖片"
                onImageClick={handleImageClick}
              />
              <h3>🚀 開始有翻修個人網站的念頭</h3>
              <p>這幾年間，學習了很多新技術，再加上想找點事情做</p>
              <p>我決定正式寫一個個人網站，並且把原有工具搬過來</p>
              <p>首先將舊個人網站裝進 docker 內，使用容器化技術進行管理</p>
            </div>
          </div>

          {/* 節點 3 - 左側，中等偏移 */}
          <div className="milestone left offset-medium">
            <div className="milestone-date">2025.04</div>
            <div className="milestone-content">
              <ImagePreview
                src={domainImage}
                alt="域名圖片"
                onImageClick={handleImageClick}
              />
              <h3>🎨 夢.台灣</h3>
              <p>到中華電信花 800 申請了「夢.台灣」</p>
              <p>個人私心覺得中華電信又貴又爛</p>
              <p>但是為了「中文網站」，只好忍痛使用</p>
            </div>
          </div>

          {/* 節點 4 - 右側，大偏移 */}
          <div className="milestone right offset-medium">
            <div className="milestone-date">2025.07.17</div>
            <div className="milestone-content">
              <ImagePreview
                src={loginImage}
                alt="登入畫面"
                onImageClick={handleImageClick}
              />
              <h3>⚙️ 後端-啟用</h3>
              <p>基於 Gin 框架的後端服務正式啟用，目前只有登入功能</p>
              <p>使用 go 語言的原因是因為我還沒學過他</p>
              <p>學習過程覺得 go 語言好有趣，有機會再談談他</p>
            </div>
          </div>

          {/* 節點 6 - 中央，特殊樣式 */}
          <div className="milestone center special">
            <div className="milestone-date">現在</div>
            <div className="milestone-content">
              <ImagePreview
                src={homeImage}
                alt="主畫面"
                onImageClick={handleImageClick}
              />
              <h3>🛠️ 持續進化</h3>
              <p>當前的主要目標是完善所有頁面功能，打造流暢的使用體驗</p>
              <p>逐步將舊有工具遷移至新平台，並規劃加入雲端記事本等實用功能</p>
              <p>這個數位空間將持續成長，承載更多創意與可能性</p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default SiteHistory;

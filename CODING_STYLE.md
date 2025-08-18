# 編程風格指南 (動態學習版)

> **重要說明**: 這個文件會根據開發者的糾正和偏好自動更新。AI 助手會觀察每次糾正並更新相應的規則。

## 版本記錄
- **最後更新**: 2025-08-09
- **更新原因**: 添加 Console 使用偏好和隨機播放功能改進
- **修改次數**: 1

---

## React 組件架構

### 基本原則 (可學習調整)
- ✅ 每個組件都有獨立的文件夾
- ✅ 組件文件夾包含：JSX 文件、CSS 文件
- ✅ 使用自定義 hooks 管理業務邏輯
- ✅ 組件應該保持單一職責

### 學習到的偏好
> 這個區域會根據您的糾正自動更新

```
- Console 輸出: 只輸出錯誤和重要資訊，避免過多調試信息
- 隨機播放: 使用純粹的隨機算法，不要複雜的播放歷史邏輯
- 開發流程: 不要執行 npm run build，專注於開發和運行時測試
```

---

## 開發流程偏好

### 測試和建置策略
- ✅ 使用 `npm start` 進行開發伺服器測試
- ❌ **避免執行 `npm run build`** - 專注於開發階段測試
- ✅ 透過瀏覽器直接測試功能
- ✅ 即時查看運行時錯誤和行為
- ❌ 不需要編譯檢查，優先考慮實際使用體驗

### 開發測試流程
```bash
# ✅ 推薦的開發流程
npm start  # 啟動開發伺服器
# 在瀏覽器中測試功能

# ❌ 避免的流程
npm run build  # 不需要建置檢查
```

---

## Console 使用規範

### 基本原則
- ❌ 避免在生產代碼中使用過多 `console.log`
- ✅ 只保留錯誤資訊 `console.error`
- ✅ 重要警告使用 `console.warn`
- ❌ 移除調試用的狀態追蹤日誌
- ❌ 移除 API 載入過程的詳細記錄

### 允許的 Console 使用
```javascript
// ✅ 錯誤處理
console.error('API 呼叫失敗:', error);

// ✅ 重要警告
console.warn('功能已棄用，請使用新方法');

// ❌ 避免的用法
console.log('載入中...'); // 太頻繁
console.log('狀態變化:', state); // 調試資訊
console.log('API 返回:', response); // 開發用途
```

---

## 隨機播放最佳實踐

### 純粹隨機原則
- ✅ 每次都從所有可播放影片中隨機選擇
- ❌ 不使用複雜的播放歷史去重
- ❌ 不使用播放佇列優先邏輯
- ✅ 保持簡單的隨機數算法

### 隨機播放實現模板
```javascript
// ✅ 簡單純粹的隨機播放
const handleRandomPlay = () => {
  const playableVideos = videos.filter(v => v.status === 'playable');
  if (playableVideos.length === 0) return;
  
  const randomIndex = Math.floor(Math.random() * playableVideos.length);
  const selectedVideo = playableVideos[randomIndex];
  playVideo(selectedVideo);
};
```

---

## 文件命名規範

### 當前規則
- 組件文件：`ComponentName.jsx`
- 樣式文件：`ComponentName.css`
- Hook 文件：`useHookName.js`
- 工具函數：`utilityName.js`

### 觀察到的模式
> AI 會在此記錄您常用的命名模式

```
- 目前無特殊模式記錄
- 等待學習您的命名偏好...
```

---

## 組件結構模板

### 標準模板 (會根據您的修改進化)
```jsx
import React from 'react';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2, onAction }) => {
  return (
    <div className="component-name">
      {/* 組件內容 */}
    </div>
  );
};

export default ComponentName;
```

### 您偏好的改進
> 基於您的糾正學習到的改進點

```
目前無改進記錄
```

---

## CSS 風格

### 當前偏好
- 使用 CSS Grid 和 Flexbox 進行佈局
- 變數命名使用 kebab-case
- 使用 CSS 自定義屬性進行主題管理
- 響應式設計優先

### 學習到的 CSS 模式
> 記錄您經常糾正的 CSS 寫法

```
目前無特殊 CSS 模式記錄
```

---

## 狀態管理

### 基本策略
- 簡單狀態使用 useState
- 複雜邏輯抽取到自定義 hooks
- 多個相關狀態使用 useReducer

### 您的狀態管理偏好
> 根據您的實際使用學習

```
等待學習您的狀態管理習慣...
```

---

## 命名約定

### 基礎規則
- 組件名稱：PascalCase
- 函數名稱：camelCase
- 常量：UPPER_SNAKE_CASE
- CSS 類名：kebab-case

### 特殊命名偏好
> AI 觀察到的您的特殊命名習慣

```
目前無特殊命名偏好記錄
```

---

## 🤖 AI 學習指南

### 如何更新這個文件
1. **觀察模式**: 當開發者糾正代碼時，分析糾正的類型
2. **記錄偏好**: 將常見的糾正模式添加到相應章節
3. **更新日期**: 每次更新都要修改版本記錄
4. **保持簡潔**: 只記錄重要和重複的偏好

### 需要學習的糾正類型
- [ ] 組件結構調整
- [ ] 命名方式改變
- [ ] CSS 寫法偏好
- [ ] Hook 使用模式
- [ ] 錯誤處理方式
- [ ] 註釋風格
- [ ] 導入順序偏好

### 學習觸發條件
- 當開發者修改 AI 生成的代碼時
- 當開發者提供特定的代碼風格要求時
- 當開發者重複糾正同類型問題時

---

## 🔄 自動更新機制

> **提示**: 每當您糾正 AI 生成的代碼時，請簡單說明原因，AI 會自動更新這個文件。

### 更新格式範例
```markdown
### 學習記錄 - 2025-08-08
- **糾正類型**: 組件結構
- **具體改動**: 將 useState 聲明移到 useEffect 之前
- **原因**: 提高可讀性
- **應用範圍**: 所有功能性組件
```

---

## 📊 學習統計

### 糾正次數統計
- 組件結構: 0 次
- 命名規範: 0 次  
- CSS 風格: 0 次
- Hook 使用: 0 次
- 其他: 0 次

### 最常見的糾正類型
```
等待收集數據...
```

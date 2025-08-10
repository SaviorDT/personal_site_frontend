# 開發規範與偏好設定

## API 請求規範

### 全域 API Client 使用規範

從 2025-08-10 開始，所有 API 請求都應該使用全域的 `apiClient` 實例，而不是直接使用 `fetch` 或創建新的 `axios` 實例。

#### ✅ 正確做法

```javascript
// 導入全域 apiClient
import apiClient, { handleApiError } from '@/services/apiClient';

// 使用 apiClient 發送請求
try {
  const response = await apiClient.get('/api/endpoint', {
    params: { param1: 'value1' },
    requiresAuth: false // 如果不需要身份驗證，明確標示
  });
  
  const data = response.data;
  // 處理成功響應
} catch (error) {
  // 使用全域錯誤處理函數
  const errorResponse = handleApiError(error, '預設錯誤訊息');
  console.error('API Error:', errorResponse.error);
}
```

#### ❌ 避免的做法

```javascript
// 不要直接使用 fetch
const response = await fetch('/api/endpoint');

// 不要創建新的 axios 實例
const newAxios = axios.create({ baseURL: 'some-url' });
```

### apiClient 優勢

1. **統一配置**: 統一的 baseURL、timeout、headers 設定
2. **統一錯誤處理**: 自動處理 401 錯誤和身份驗證失效
3. **攔截器支持**: 可以全域添加請求/響應處理邏輯
4. **一致性**: 確保所有 API 請求行為一致
5. **易於維護**: 集中管理所有 API 配置

### 特殊情況標記

對於不需要身份驗證的請求，請在配置中明確標示：

```javascript
const response = await apiClient.get('/public-endpoint', {
  requiresAuth: false
});
```

這樣可以避免 401 錯誤時觸發不必要的登出流程。

### 檔案結構

- `/src/services/apiClient.js` - 全域 API 客戶端
- `/src/services/authService.js` - 身份驗證服務（使用 apiClient）
- `/src/services/[otherService].js` - 其他服務（都應使用 apiClient）

### 更新歷史

- **2025-08-10**: 重構 authService.js，將 apiClient 獨立為全域模組
- **2025-08-10**: 更新 PlaylistRandomize 項目使用全域 apiClient

## 其他開發偏好

### 錯誤處理

- 使用 `handleApiError` 函數進行統一的錯誤處理
- 錯誤訊息應該用戶友好，避免直接顯示技術錯誤
- 重要錯誤應該記錄到 console 以便調試

### 代碼組織

- Hook 應該放在對應功能模組的 `hooks/` 目錄下
- Service 應該放在 `/src/services/` 目錄下
- 工具函數應該放在對應功能模組的 `utils/` 目錄下

### 導入路徑

- 使用 `@/` 別名指向 `/src` 目錄
- 相對路徑用於同一模組內的文件引用
- 絕對路徑用於跨模組引用

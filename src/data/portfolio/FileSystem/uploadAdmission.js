// 跨檔案併發准入（admission controller）——純函式，無狀態物件。
// 從 uploadScheduler.js 拆出：規則不變，但改為直接吃兩個「已算好的數字」
// （目前正在上傳的檔案數、這些檔案累計宣告的位元組），保留單位仍是「整檔宣告大小」。
// 由 uploadQueueState.js 的 selector 在需要時即時從 entries 推導那兩個數字。

export const MAX_PARALLEL_FILES = 16; // 同時上傳的檔案數上限
export const MAX_PARALLEL_SIZE = 100 * 1024 * 1024; // 同時上傳的累計保留位元組上限（100MB）

// 是否允許再多放行一個檔案進入「上傳中」：
// - 檔案數上限（16）任何時候都適用
// - 只要目前已保留的位元組還沒超過上限就可以再加入一個新檔案（不把即將加入的大小算進去）
export const canAdmitFile = (activeCount, activeBytes) =>
    activeBytes <= MAX_PARALLEL_SIZE && activeCount < MAX_PARALLEL_FILES;

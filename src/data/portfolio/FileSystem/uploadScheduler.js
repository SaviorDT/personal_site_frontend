// 單檔案 chunk-size 規劃器：依上一段的傳輸速率線性外插下一段目標大小。
// 純邏輯（無 axios、無 React、無真實 timer；時間/速率一律以參數傳入）。
// 契約：對外回傳的 chunkSize 恆為 [MIN, MAX] 範圍內的整數。
// 跨檔案的併發准入已拆到 uploadAdmission.js。

export const MIN_CHUNK_SIZE = 100 * 1024; // 100KB 下限
export const INIT_CHUNK_SIZE = 1024 * 1024; // 1MB 初始值
export const MAX_CHUNK_SIZE = 100 * 1024 * 1024; // 100MB 上限
export const TARGET_WINDOW_MS = 3000; // 以 3 秒為預估窗口
export const TIMEOUT_SHRINK_DIVISOR = 20; // timeout 後下一個目標除以此值
export const MAX_SEGMENT_ATTEMPTS = 3; // 同一段最多重試次數（含 timeout）

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const createSegmentState = () => ({
    chunkSize: INIT_CHUNK_SIZE,
    attempts: 0,
    status: 'pending',
});

// 一段成功上傳後：依剛完成那段的速率線性外插下一段目標大小，並重置該檔案的重試計數
export const recordChunkSuccess = (state, { chunkBytes, elapsedMs }) => {
    const rate = chunkBytes / elapsedMs; // bytes/ms
    const target = rate * TARGET_WINDOW_MS;
    // chunkSize 是「位元組數」，必須是整數：先夾在 [MIN, MAX]，再向下取整
    // （用 floor 不用 round，確保永遠不會因進位而超過 MAX 或當段的 remaining）
    return {
        chunkSize: Math.floor(clamp(target, MIN_CHUNK_SIZE, MAX_CHUNK_SIZE)),
        attempts: 0,
        status: 'pending',
    };
};

// 一段失敗（timeout 或其他錯誤，共用同一個重試計數）：
// - timeout 額外把下一個目標除以 20（仍受 100KB 下限保護），之後恢復正常線性外插成長
// - 累計滿 3 次失敗後，整個檔案標記為 failed
export const recordChunkFailure = (state, { isTimeout = false } = {}) => {
    const attempts = state.attempts + 1;
    if (attempts >= MAX_SEGMENT_ATTEMPTS) {
        return { ...state, attempts, status: 'failed' };
    }
    const chunkSize = isTimeout
        ? Math.max(MIN_CHUNK_SIZE, Math.floor(state.chunkSize / TIMEOUT_SHRINK_DIVISOR))
        : Math.floor(state.chunkSize); // 契約：對外的 chunkSize 恆為整數（即使非 timeout 只是原樣沿用）
    return { chunkSize, attempts, status: 'pending' };
};

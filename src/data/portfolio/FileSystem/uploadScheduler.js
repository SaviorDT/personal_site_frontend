// 上傳排程純邏輯（無 axios、無 React、無真實 timer；時間/速率一律以參數傳入）
// - 單檔案 chunk-size 規劃器：依上一段的傳輸速率線性外插下一段目標大小
// - 跨檔案 admission controller：以「整檔宣告大小」為保留單位，控制同時上傳的檔案數與總位元組

export const MIN_CHUNK_SIZE = 100 * 1024; // 100KB 下限
export const INIT_CHUNK_SIZE = 1024 * 1024; // 1MB 初始值
export const MAX_CHUNK_SIZE = 100 * 1024 * 1024; // 100MB 上限
export const TARGET_WINDOW_MS = 3000; // 以 3 秒為預估窗口
export const TIMEOUT_SHRINK_DIVISOR = 20; // timeout 後下一個目標除以此值
export const MAX_SEGMENT_ATTEMPTS = 3; // 同一段最多重試次數（含 timeout）

export const MAX_PARALLEL_FILES = 16; // 同時上傳的檔案數上限
export const MAX_PARALLEL_SIZE = 100 * 1024 * 1024; // 同時上傳的累計保留位元組上限（100MB）

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
    return {
        chunkSize: clamp(target, MIN_CHUNK_SIZE, MAX_CHUNK_SIZE),
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
        : state.chunkSize;
    return { chunkSize, attempts, status: 'pending' };
};

// 跨檔案 admission controller：保留單位是「整檔宣告大小」，開始上傳時保留、完全結束才釋放
export const createAdmissionState = () => ({ activeCount: 0, activeBytes: 0 });

// 是否允許把 fileSize 這個新檔案加入目前正在上傳的集合
// - 檔案數上限（16）任何時候都適用
// - 只要目前還沒超過上限就可以加入新的檔案
export const canAdmitFile = (state) => {
    return state.activeBytes <= MAX_PARALLEL_SIZE && state.activeCount < MAX_PARALLEL_FILES;
};

export const admitFile = (state, fileSize) => ({
    activeCount: state.activeCount + 1,
    activeBytes: state.activeBytes + fileSize,
});

export const releaseFile = (state, fileSize) => ({
    activeCount: Math.max(0, state.activeCount - 1),
    activeBytes: Math.max(0, state.activeBytes - fileSize),
});

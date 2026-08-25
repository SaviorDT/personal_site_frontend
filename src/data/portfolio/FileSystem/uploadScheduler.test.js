import {
    createSegmentState, recordChunkSuccess, recordChunkFailure,
    createAdmissionState, canAdmitFile, admitFile, releaseFile,
    MIN_CHUNK_SIZE, INIT_CHUNK_SIZE, MAX_CHUNK_SIZE, MAX_PARALLEL_FILES, MAX_PARALLEL_SIZE,
} from './uploadScheduler';

test('第一個 chunk 固定為 1MB（初始值，與一般下限無關）', () => {
    const state = createSegmentState();
    expect(state.chunkSize).toBe(INIT_CHUNK_SIZE);
    expect(state.chunkSize).toBe(1 * 1024 * 1024);
});

test('成功後依速率線性外插：下一個目標 = rate * 3000ms', () => {
    const state = createSegmentState(); // chunkSize = 1MB
    // 1MB 花了 500ms → rate = 2MB/s → 3 秒窗口 = 6MB
    const next = recordChunkSuccess(state, { chunkBytes: 1 * 1024 * 1024, elapsedMs: 500 });
    expect(next.chunkSize).toBe(6 * 1024 * 1024);
});

test('線性外插結果超過 100MB 時，命中上限', () => {
    const state = createSegmentState();
    // 10MB 花了 100ms → rate = 100MB/s → 3 秒窗口 = 300MB，遠超上限
    const next = recordChunkSuccess(state, { chunkBytes: 10 * 1024 * 1024, elapsedMs: 100 });
    expect(next.chunkSize).toBe(MAX_CHUNK_SIZE);
});

test('線性外插結果低於 100KB 時，命中一般下限', () => {
    const state = createSegmentState();
    // 1MB 花了 60000ms → rate 極慢 → 3 秒窗口遠小於 100KB
    const next = recordChunkSuccess(state, { chunkBytes: 1 * 1024 * 1024, elapsedMs: 60000 });
    expect(next.chunkSize).toBe(MIN_CHUNK_SIZE);
    expect(next.chunkSize).toBe(100 * 1024);
});

test('非 timeout 失敗：chunkSize 不變，attempts +1，狀態仍為 pending', () => {
    const state = { chunkSize: 6 * 1024 * 1024, attempts: 0, status: 'pending' };
    const next = recordChunkFailure(state, { isTimeout: false });
    expect(next.chunkSize).toBe(6 * 1024 * 1024);
    expect(next.attempts).toBe(1);
    expect(next.status).toBe('pending');
});

test('timeout 失敗：下一個目標除以 20', () => {
    const state = { chunkSize: 40 * 1024 * 1024, attempts: 0, status: 'pending' };
    const next = recordChunkFailure(state, { isTimeout: true });
    expect(next.chunkSize).toBe(2 * 1024 * 1024);
    expect(next.attempts).toBe(1);
});

test('連續 timeout 除到底也不會低於 100KB 下限', () => {
    let state = { chunkSize: MIN_CHUNK_SIZE, attempts: 0, status: 'pending' };
    state = recordChunkFailure(state, { isTimeout: true });
    expect(state.chunkSize).toBe(MIN_CHUNK_SIZE);
});

test('第 3 次失敗（含 timeout）後，整個檔案標記為 failed', () => {
    let state = { chunkSize: 10 * 1024 * 1024, attempts: 0, status: 'pending' };
    state = recordChunkFailure(state, { isTimeout: false }); // 第 1 次
    state = recordChunkFailure(state, { isTimeout: true });  // 第 2 次（timeout 也算）
    state = recordChunkFailure(state, { isTimeout: false }); // 第 3 次 → 用盡
    expect(state.status).toBe('failed');
    expect(state.attempts).toBe(3);
});

test('該段最終成功後，重試計數重置為 0，進入下一段', () => {
    let state = { chunkSize: 40 * 1024 * 1024, attempts: 2, status: 'pending' }; // 已失敗過 2 次
    state = recordChunkSuccess(state, { chunkBytes: 1 * 1024 * 1024, elapsedMs: 500 });
    expect(state.attempts).toBe(0);
    expect(state.status).toBe('pending');
});

test('沒有任何檔案在上傳時，一定會被接受', () => {
    const state = createAdmissionState();
    expect(canAdmitFile(state)).toBe(true);
});

test('admission 只看目前已保留的位元組是否已超過上限，不會把即將加入的新檔案大小算進去', () => {
    // 已保留 90MB（1 個檔案在傳），還沒超過 100MB 上限 → 即使接下來要加入的檔案本身很大，仍判定可接受
    let state = createAdmissionState();
    state = admitFile(state, 90 * 1024 * 1024);
    expect(canAdmitFile(state)).toBe(true); // 90MB <= 100MB，尚未超標
});

test('一旦已保留位元組超過上限，才會拒絕新檔案', () => {
    let state = createAdmissionState();
    state = admitFile(state, 60 * 1024 * 1024);
    state = admitFile(state, 50 * 1024 * 1024); // 累計 110MB，已超過 100MB 上限
    expect(canAdmitFile(state)).toBe(false);
});

test('已保留位元組剛好等於上限時仍允許（邊界）', () => {
    let state = createAdmissionState();
    state = admitFile(state, MAX_PARALLEL_SIZE);
    expect(canAdmitFile(state)).toBe(true);
});

test('releaseFile 釋放後，被保留的位元組與檔案數會減少，超標狀態也會恢復', () => {
    let state = createAdmissionState();
    state = admitFile(state, 60 * 1024 * 1024);
    state = admitFile(state, 50 * 1024 * 1024); // 累計 110MB，超標
    expect(canAdmitFile(state)).toBe(false);
    state = releaseFile(state, 60 * 1024 * 1024); // 釋放其中一個，剩 50MB
    expect(state.activeCount).toBe(1);
    expect(state.activeBytes).toBe(50 * 1024 * 1024);
    expect(canAdmitFile(state)).toBe(true);
});

test('檔案數達到 16 上限時，即使位元組預算充足也拒絕', () => {
    let state = createAdmissionState();
    for (let i = 0; i < MAX_PARALLEL_FILES; i++) {
        state = admitFile(state, 1024); // 每個都很小，不會觸發位元組上限
    }
    expect(state.activeCount).toBe(MAX_PARALLEL_FILES);
    expect(canAdmitFile(state)).toBe(false);
});

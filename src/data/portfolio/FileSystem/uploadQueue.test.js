// Seam 1：createUploadQueue（runner）+ 注入的 fake uploadFile / cancelFileUpload。
// 這裡一併驗證 reducer + store + admission 在真實脈絡下的行為（它們沒有各自的測試檔）。
// 只透過 runner 的公開 facade 觀察：訂閱者看到的 state、發出去的請求、進度是否傳達。

import { vi } from 'vitest';
import { createUploadQueueStore, createUploadQueue } from './uploadQueueState';
import { MAX_PARALLEL_SIZE } from './uploadAdmission';

// fake uploader：每次呼叫記錄一筆，可由測試主動 resolve / reject / 驅動 callback
const makeFakeUploader = () => {
    const calls = [];
    const uploadFile = vi.fn((pathArr, file, opts) => {
        let resolve, reject;
        const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
        calls.push({ pathArr, file, opts, resolve, reject });
        return promise;
    });
    return { uploadFile, calls };
};

const task = (id, size = 10, extra = {}) => ({
    id,
    name: `${id}.bin`,
    pathArr: ['/'],
    file: { name: `${id}.bin`, size },
    size,
    ...extra,
});

const setup = () => {
    const { uploadFile, calls } = makeFakeUploader();
    const cancelFileUpload = vi.fn().mockResolvedValue(undefined);
    const store = createUploadQueueStore();
    const queue = createUploadQueue(store, { uploadFile, cancelFileUpload });
    const statusOf = (id) => queue.getState().entries.find((e) => e.id === id)?.status;
    return { queue, calls, cancelFileUpload, statusOf };
};

const flush = () => new Promise((r) => setTimeout(r, 0));

test('enqueue：所有檔案立刻出現在佇列裡，訂閱者收到通知', () => {
    const { queue } = setup();
    const seen = [];
    queue.subscribe(() => seen.push(queue.getState().entries.length));

    queue.enqueue([task('a'), task('b'), task('c')]);

    expect(queue.getState().entries.map((e) => e.id)).toEqual(['a', 'b', 'c']);
    expect(seen.length).toBeGreaterThan(0);
});

test('admission 依累計位元組限流：超過預算的檔案先等待，前一個結束後自動開始', async () => {
    const { queue, calls, statusOf } = setup();
    const big = MAX_PARALLEL_SIZE + 1;
    queue.enqueue([task('a', big), task('b', big)]);

    // a 先開跑，b 因為 activeBytes 已超過上限而卡在 queued
    expect(calls.length).toBe(1);
    expect(statusOf('a')).toBe('uploading');
    expect(statusOf('b')).toBe('queued');

    calls[0].resolve();
    await flush();

    // a 完成釋出預算 → b 自動被放行
    expect(calls.length).toBe(2);
    expect(statusOf('a')).toBe('success');
    expect(statusOf('b')).toBe('uploading');
});

test('cancelAll：進行中與尚未開始的都被取消，之後沒有任何東西繼續上傳', async () => {
    const { queue, calls, statusOf } = setup();
    const big = MAX_PARALLEL_SIZE + 1;
    queue.enqueue([task('a', big), task('b', big), task('c', big)]);

    expect(statusOf('a')).toBe('uploading');
    expect(statusOf('b')).toBe('queued');

    queue.cancelAll();

    expect(statusOf('a')).toBe('cancelled');
    expect(statusOf('b')).toBe('cancelled');
    expect(statusOf('c')).toBe('cancelled');
    expect(calls[0].opts.signal.aborted).toBe(true);

    // 進行中的請求 reject（abort）後，不應把任何等待中的檔案 pump 進來
    calls[0].reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    await flush();
    expect(calls.length).toBe(1);
    expect(queue.getState().entries.every((e) => e.status === 'cancelled')).toBe(true);
});

test('取消一個「還沒開始」的檔案：直接進入 cancelled，不會閃一下 uploading', () => {
    const { queue, statusOf } = setup();
    const big = MAX_PARALLEL_SIZE + 1;
    queue.enqueue([task('a', big), task('b', big)]);
    expect(statusOf('b')).toBe('queued');

    queue.cancel('b');
    expect(statusOf('b')).toBe('cancelled');
});

test('取消一個進行中的檔案：abort 訊號送出，並呼叫伺服器端取消（已知 session）', () => {
    const { queue, calls, cancelFileUpload, statusOf } = setup();
    queue.enqueue([task('a')]);
    calls[0].opts.onSessionStart('sess-a');

    queue.cancel('a');

    expect(statusOf('a')).toBe('cancelled');
    expect(calls[0].opts.signal.aborted).toBe(true);
    expect(cancelFileUpload).toHaveBeenCalledWith(['/'], 'a.bin', 'sess-a');
});

test('只有 failed 可以重試；success / cancelled 不受 retry 影響', async () => {
    const { queue, calls, statusOf } = setup();
    queue.enqueue([task('a'), task('b')]);

    calls[0].resolve();                       // a → success
    calls[1].reject(new Error('boom'));       // b → failed
    await flush();
    expect(statusOf('a')).toBe('success');
    expect(statusOf('b')).toBe('failed');

    queue.retry('a'); // success 不可重試 → no-op
    expect(statusOf('a')).toBe('success');

    queue.retry('b'); // failed → 重新排程
    expect(statusOf('b')).toBe('uploading');
    expect(calls.length).toBe(3);
});

test('retryAll 只碰 failed，且帶著 resume 資訊（session/offset）重跑', async () => {
    const { queue, calls, statusOf } = setup();
    queue.enqueue([task('a'), task('b'), task('c')]);

    calls[0].resolve();                                    // a success
    calls[1].opts.onSessionStart('sess-b');
    calls[1].opts.onProgress({ uploadedBytes: 4 });
    calls[1].reject(Object.assign(new Error('net'), { sessionId: 'sess-b', uploadedBytes: 4 }));
    calls[2].opts.onSessionStart('sess-c');
    await flush();

    // c 還在跑
    expect(statusOf('c')).toBe('uploading');

    queue.retryAll();

    expect(statusOf('a')).toBe('success');   // 未受影響
    expect(statusOf('c')).toBe('uploading'); // 未受影響
    expect(statusOf('b')).toBe('uploading'); // 只有 b 被重試

    const retryCall = calls[calls.length - 1];
    expect(retryCall.opts.resumeSessionId).toBe('sess-b');
    expect(retryCall.opts.resumeOffset).toBe(4);
});

test('重試同樣受 admission 限流，不會一次全部發出去', async () => {
    const { queue, calls } = setup();
    const big = MAX_PARALLEL_SIZE + 1;
    queue.enqueue([task('a', big), task('b', big), task('c', big)]);

    // 逐一讓進行中的失敗；失敗釋出預算後下一個才被放行，最後三個全部 failed
    calls[0].reject(new Error('x'));
    await flush();
    calls[1].reject(new Error('x'));
    await flush();
    calls[2].reject(new Error('x'));
    await flush();
    expect(queue.getState().entries.every((e) => e.status === 'failed')).toBe(true);

    queue.retryAll();

    // 只有一個能進 uploading（預算一次只夠一個），其餘回到 queued
    const byStatus = queue.getState().entries.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
    }, {});
    expect(byStatus.uploading).toBe(1);
    expect(byStatus.queued).toBe(2);
});

test('進度事件會反映到 state，讓訂閱者看得到', async () => {
    const { queue, calls } = setup();
    queue.enqueue([task('a', 100)]);
    const progresses = [];
    queue.subscribe(() => {
        progresses.push(queue.getState().entries[0].uploadedBytes);
    });

    calls[0].opts.onProgress({ uploadedBytes: 30 });
    calls[0].opts.onProgress({ uploadedBytes: 100 });

    expect(progresses).toContain(30);
    expect(progresses).toContain(100);
});

test('剛轉為 success 的 entry 可被觀察到（供目錄刷新用）', async () => {
    const { queue, calls } = setup();
    queue.enqueue([task('a')]);
    const successSnapshots = [];
    queue.subscribe(() => {
        successSnapshots.push(queue.getState().entries.filter((e) => e.status === 'success').map((e) => e.id));
    });

    calls[0].resolve();
    await flush();

    expect(successSnapshots.some((snap) => snap.includes('a'))).toBe(true);
});

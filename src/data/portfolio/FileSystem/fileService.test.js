// runResumableUpload（經 uploadFile 進入）的 offset 記帳測試
// 重點：每個 PUT segment 的 offset 必為整數、嚴格連續，且等於先前所有已送出位元組之和。
// 這是 repo 第一個 vi.mock —— 只攔 apiClient，其餘（config、i18n）維持真實。

import { vi } from 'vitest';
import apiClient from '@/services/apiClient';
import { uploadFile } from './fileService';

vi.mock('@/services/apiClient', () => ({
    default: {
        post: vi.fn(),
        put: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
    },
    handleApiError: vi.fn(() => ({ error: 'mock error', statusCode: 500 })),
}));

const makeFile = (size, name = 'blob.bin') => new File([new Uint8Array(size)], name);

const putOffsets = () => apiClient.put.mock.calls.map(([, , config]) => config.params.offset);

beforeEach(() => {
    vi.clearAllMocks();
    apiClient.post.mockResolvedValue({ data: { session_id: 'sess-1' } });
    apiClient.put.mockResolvedValue({ data: { status: 'in_progress' } });
    // performance.now() 在正式環境是小數；每次呼叫遞增小數值 → 每段 elapsedMs 為小數
    // → recordChunkSuccess 的線性外插結果為小數 → 若未取整，offset 就會開始漂移
    let clock = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => (clock += 1499.75));
});

afterEach(() => {
    vi.restoreAllMocks();
});

test('多段上傳：每個 PUT 的 offset 為整數、嚴格連續、總和等於檔案大小', async () => {
    const SIZE = 5 * 1024 * 1024 + 12345; // 非整齊的總大小
    await uploadFile(['/'], makeFile(SIZE), {});

    const calls = apiClient.put.mock.calls;
    expect(calls.length).toBeGreaterThan(1); // 確實走了多段

    let expectedOffset = 0;
    for (const [, body, config] of calls) {
        const { offset } = config.params;
        expect(Number.isInteger(offset)).toBe(true);
        expect(offset).toBe(expectedOffset);
        expect(Number.isInteger(body.size)).toBe(true);
        expectedOffset += body.size;
    }
    expect(expectedOffset).toBe(SIZE);
});

test('onProgress 回報的 uploadedBytes 全程為整數且收斂到 totalBytes', async () => {
    const SIZE = 3 * 1024 * 1024 + 777;
    const seen = [];
    await uploadFile(['/'], makeFile(SIZE), { onProgress: (p) => seen.push(p) });

    expect(seen.length).toBeGreaterThan(0);
    for (const p of seen) {
        expect(Number.isInteger(p.uploadedBytes)).toBe(true);
        expect(Number.isInteger(p.chunkBytes)).toBe(true);
    }
    expect(seen[seen.length - 1].uploadedBytes).toBe(SIZE);
});

test('某段 PUT 失敗後重試：重試那次的 offset 仍是整數，且與失敗那次相同', async () => {
    let putCount = 0;
    apiClient.put.mockImplementation(async () => {
        putCount += 1;
        if (putCount === 2) throw new Error('network blip'); // 非 abort、非 timeout
        return { data: {} };
    });

    await uploadFile(['/'], makeFile(4 * 1024 * 1024 + 999), {});

    const offsets = putOffsets();
    offsets.forEach((o) => expect(Number.isInteger(o)).toBe(true));
    // 第 2 次（失敗）與第 3 次（重試）指向同一個 offset
    expect(offsets[2]).toBe(offsets[1]);
});

test('resumeOffset 帶進非整數時，第一個 PUT 的 offset 被向下取整，且不重開 session', async () => {
    await uploadFile(['/'], makeFile(3 * 1024 * 1024), {
        resumeSessionId: 'sess-x',
        resumeOffset: 1048576.99,
    });

    expect(apiClient.post).not.toHaveBeenCalled();
    const offsets = putOffsets();
    expect(offsets[0]).toBe(1048576);
    offsets.forEach((o) => expect(Number.isInteger(o)).toBe(true));
});

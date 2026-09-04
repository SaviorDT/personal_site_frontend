// Seam 5：一個很薄的元件渲染測試。只驗證「狀態 → 控制項」的接線，
// 因為所有邏輯都在底下的純／可注入模組（見 uploadQueue.test.js）。
// prior art：src/App.test.jsx（同樣用 @testing-library/react 的渲染測試）。

import React from 'react';
import { vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import i18n from '@/i18n';
import { createUploadQueueStore, createUploadQueue } from './uploadQueueState';

let mockQueue; // 由 beforeEach 指派；工廠在 render 時才被呼叫，屆時已就緒

vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock('./fileService', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        listDirectory: vi.fn().mockResolvedValue([]),
        createStorageUploadQueue: () => mockQueue,
    };
});

import FileSystem from './FileSystem';

const task = (id, size = 10) => ({
    id, name: `${id}.bin`, pathArr: ['/'], file: { name: `${id}.bin`, size }, size,
});

let fakeCalls;

beforeEach(async () => {
    await i18n.changeLanguage('zh');
    fakeCalls = [];
    const uploadFile = vi.fn((pathArr, file, opts) => new Promise((resolve, reject) => {
        fakeCalls.push({ opts, resolve, reject });
    }));
    mockQueue = createUploadQueue(createUploadQueueStore(), {
        uploadFile,
        cancelFileUpload: vi.fn().mockResolvedValue(undefined),
    });
});

test('「全部取消」後，沒有任何一列停在 uploading', async () => {
    let container;
    await act(async () => { ({ container } = render(<FileSystem />)); });

    act(() => {
        mockQueue.enqueue([task('a'), task('b')]);
    });
    expect(container.querySelectorAll('.fs-upload-row--uploading').length).toBe(2);

    act(() => {
        mockQueue.cancelAll();
    });
    expect(container.querySelectorAll('.fs-upload-row--uploading').length).toBe(0);
    expect(container.querySelectorAll('.fs-upload-row--cancelled').length).toBe(2);
});

test('已取消的列不顯示重試控制項；失敗的列才有', async () => {
    let container;
    await act(async () => { ({ container } = render(<FileSystem />)); });

    act(() => {
        mockQueue.enqueue([task('a'), task('b')]);
    });

    act(() => { mockQueue.cancel('a'); });
    await act(async () => { fakeCalls[1].reject(new Error('boom')); });

    const cancelledRow = container.querySelector('.fs-upload-row--cancelled');
    const failedRow = container.querySelector('.fs-upload-row--failed');
    expect(cancelledRow).toBeTruthy();
    expect(failedRow).toBeTruthy();
    expect(cancelledRow.querySelector('.fs-upload-retry')).toBeNull();
    expect(failedRow.querySelector('.fs-upload-retry')).toBeTruthy();
});

test('「全部重試」只有在有失敗的列時才出現', async () => {
    await act(async () => { render(<FileSystem />); });

    act(() => {
        mockQueue.enqueue([task('a')]);
    });
    expect(screen.queryByText('全部重試')).toBeNull();

    await act(async () => {
        fakeCalls[0].reject(new Error('boom'));
    });
    expect(screen.getByText('全部重試')).toBeTruthy();
});

// 上傳佇列——單一權威狀態來源。
// 取代舊版「元件的 uploadEntries state」與「scheduler 私有 pending[] 清單」的分裂，
// 讓 UI 看到的東西和排程器接下來要跑的東西不可能對不上。
//
// 三層：
//   Layer 1（本檔案）純狀態：uploadQueueReducer + selectors + createUploadQueueStore
//   Layer 2（uploadAdmission.js）純准入判斷
//   Layer 3（本檔案 createUploadQueue）薄薄的 runner：只擁有 Map<entryId, AbortController>，
//           所有權威狀態一律經 store.dispatch 與 selector，不直接改 state。
//
// entry 形狀：{ id, name, pathArr, file, size, status, uploadedBytes, sessionId, error }
// 狀態機（cancelled 為終態、只有 failed 可重試）：
//   queued    → uploading | cancelled
//   uploading → success | failed | cancelled
//   failed    → queued            (RETRY)
//   success   → (終態；只能 REMOVE)
//   cancelled → (終態；只能 REMOVE)
// 任何不在表上的轉移都是 no-op（不丟例外）——cancel 與 settle 競態時 UI 不會崩。

import { canAdmitFile } from './uploadAdmission';

export const initialQueueState = { entries: [] };

// 只在指定 entry 上套用 fn；fn 回傳原物件代表「非法轉移」→ 整個 state 參考不變（不觸發重繪）
const mapEntry = (state, id, fn) => {
    let changed = false;
    const entries = state.entries.map((e) => {
        if (e.id !== id) return e;
        const next = fn(e);
        if (next !== e) changed = true;
        return next;
    });
    return changed ? { ...state, entries } : state;
};

export const uploadQueueReducer = (state, action) => {
    switch (action.type) {
        case 'ENQUEUE': {
            const added = action.entries.map((t) => ({
                id: t.id,
                name: t.name ?? t.file?.name ?? '',
                pathArr: t.pathArr,
                file: t.file,
                size: t.size ?? t.file?.size ?? 0,
                status: 'queued',
                uploadedBytes: 0,
                sessionId: t.resumeSessionId ?? null,
                error: null,
            }));
            return { ...state, entries: [...state.entries, ...added] };
        }

        case 'FILE_STARTED':
            return mapEntry(state, action.id, (e) =>
                e.status === 'queued' ? { ...e, status: 'uploading', error: null } : e);

        case 'SESSION_STARTED':
            return mapEntry(state, action.id, (e) =>
                e.status === 'uploading' ? { ...e, sessionId: action.sessionId } : e);

        case 'PROGRESS':
            return mapEntry(state, action.id, (e) =>
                e.status === 'uploading' ? { ...e, uploadedBytes: action.uploadedBytes } : e);

        case 'SETTLED':
            return mapEntry(state, action.id, (e) => {
                if (e.status !== 'uploading') return e; // 已被 cancel 搶先 → SETTLED 變 no-op
                if (action.ok) return { ...e, status: 'success', uploadedBytes: e.size };
                return {
                    ...e,
                    status: 'failed',
                    error: action.error ?? null,
                    sessionId: action.sessionId ?? e.sessionId,
                    uploadedBytes: action.uploadedBytes ?? e.uploadedBytes,
                };
            });

        case 'CANCEL':
            return mapEntry(state, action.id, (e) =>
                (e.status === 'queued' || e.status === 'uploading') ? { ...e, status: 'cancelled' } : e);

        case 'RETRY':
            return mapEntry(state, action.id, (e) =>
                e.status === 'failed' ? { ...e, status: 'queued', error: null } : e);

        case 'REMOVE':
            return state.entries.some((e) => e.id === action.id)
                ? { ...state, entries: state.entries.filter((e) => e.id !== action.id) }
                : state;

        case 'CLEAR_SUCCEEDED':
            return state.entries.some((e) => e.status === 'success')
                ? { ...state, entries: state.entries.filter((e) => e.status !== 'success') }
                : state;

        default:
            return state;
    }
};

// ---- selectors（純函式；activeCount / activeBytes 一律即時從 entries 數，不另外維護累加器）----

export const selectActiveEntries = (state) => state.entries.filter((e) => e.status === 'uploading');

// 下一個「queued 且此刻可准入」的 entry；沒有則回 null
export const selectNextAdmissible = (state) => {
    const active = selectActiveEntries(state);
    const activeBytes = active.reduce((sum, e) => sum + (e.size || 0), 0);
    if (!canAdmitFile(active.length, activeBytes)) return null;
    return state.entries.find((e) => e.status === 'queued') || null;
};

// 進度彙總列用；entries 為空時回 null（面板整個不顯示）
export const selectSummary = (state) => {
    const { entries } = state;
    if (entries.length === 0) return null;
    const pending = (e) => e.status === 'uploading' || e.status === 'queued';
    return {
        totalFiles: entries.length,
        doneFiles: entries.filter((e) => !pending(e)).length,
        totalBytes: entries.reduce((sum, e) => sum + (e.size || 0), 0),
        doneBytes: entries.reduce((sum, e) => sum + (e.status === 'success' ? e.size : (e.uploadedBytes || 0)), 0),
        hasActive: entries.some(pending),          // 「全部取消」出現條件：有 queued 或 uploading
        hasSuccess: entries.some((e) => e.status === 'success'),
        hasFailed: entries.some((e) => e.status === 'failed'), // 「全部重試」出現條件
    };
};

// ---- store：薄薄一層 let state + getState / subscribe / dispatch ----
// 不知道上傳、網路、abort、timer 的任何事。

export const createUploadQueueStore = () => {
    let state = initialQueueState;
    const listeners = new Set();
    return {
        getState: () => state,
        subscribe: (fn) => {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
        dispatch: (action) => {
            const next = uploadQueueReducer(state, action);
            if (next === state) return; // 非法轉移／無變化 → 不通知
            state = next;
            listeners.forEach((fn) => fn());
        },
    };
};

// ---- Layer 3：runner ----
// createUploadQueue(store, { uploadFile, cancelFileUpload })
// side-effecting 的合作者一律注入，方便測試時換成 fake。
// 只擁有 ephemeral 的 Map<entryId, AbortController>；不持有權威狀態、不直接改 state。
export const createUploadQueue = (store, { uploadFile, cancelFileUpload }) => {
    const controllers = new Map(); // entryId -> AbortController

    const runEntry = (entry) => {
        const controller = controllers.get(entry.id);
        uploadFile(entry.pathArr, entry.file, {
            signal: controller?.signal,
            resumeSessionId: entry.sessionId || undefined,
            resumeOffset: entry.uploadedBytes || 0,
            onSessionStart: (sessionId) =>
                store.dispatch({ type: 'SESSION_STARTED', id: entry.id, sessionId }),
            onProgress: (progress) =>
                store.dispatch({ type: 'PROGRESS', id: entry.id, uploadedBytes: progress.uploadedBytes }),
        }).then(
            () => store.dispatch({ type: 'SETTLED', id: entry.id, ok: true }),
            (error) => store.dispatch({
                type: 'SETTLED',
                id: entry.id,
                ok: false,
                error: error?.message || String(error),
                sessionId: error?.sessionId,
                uploadedBytes: error?.uploadedBytes,
            }),
        ).finally(() => {
            controllers.delete(entry.id);
            reconcile();
        });
    };

    // pump：只要「下一個可准入」selector 還有東西，就 dispatch(FILE_STARTED) 並開跑。
    // 在 enqueue / retry / 每次 SETTLED 之後重跑。不掛在 store subscription 上——
    // 元件的 useSyncExternalStore 是唯一的 subscriber，React 18+ 會把重複通知批次化。
    const reconcile = () => {
        let next;
        while ((next = selectNextAdmissible(store.getState()))) {
            store.dispatch({ type: 'FILE_STARTED', id: next.id });
            const started = store.getState().entries.find((e) => e.id === next.id);
            if (!started || started.status !== 'uploading') break; // 理論上不會發生，防呆
            runEntry(started);
        }
    };

    const enqueue = (tasks) => {
        tasks.forEach((task) => {
            if (!controllers.has(task.id)) controllers.set(task.id, new AbortController());
        });
        store.dispatch({ type: 'ENQUEUE', entries: tasks });
        reconcile();
    };

    const cancel = (id) => {
        const entry = store.getState().entries.find((e) => e.id === id);
        if (!entry) return;
        controllers.get(id)?.abort();
        store.dispatch({ type: 'CANCEL', id });
        // 有 session_id 才需要通知伺服器釋放預留空間；盡力而為，忽略其錯誤
        if (entry.sessionId) {
            try {
                Promise.resolve(cancelFileUpload(entry.pathArr, entry.file.name, entry.sessionId)).catch(() => {});
            } catch (_) { /* ignore */ }
        }
    };

    const cancelAll = () => {
        store.getState().entries
            .filter((e) => e.status === 'queued' || e.status === 'uploading')
            .forEach((e) => cancel(e.id));
    };

    const retry = (id) => {
        const entry = store.getState().entries.find((e) => e.id === id);
        if (!entry || entry.status !== 'failed') return; // 只有 failed 可重試
        controllers.set(id, new AbortController()); // 全新的 controller
        store.dispatch({ type: 'RETRY', id });      // failed → queued，reconcile 會依 resume 資訊續傳
        reconcile();
    };

    const retryAll = () => {
        store.getState().entries.filter((e) => e.status === 'failed').forEach((e) => retry(e.id));
    };

    const remove = (id) => store.dispatch({ type: 'REMOVE', id });
    const clearSucceeded = () => store.dispatch({ type: 'CLEAR_SUCCEEDED' });

    return {
        getState: store.getState,
        subscribe: store.subscribe,
        enqueue,
        cancel,
        cancelAll,
        retry,
        retryAll,
        remove,
        clearSucceeded,
    };
};

import { canAdmitFile, MAX_PARALLEL_FILES, MAX_PARALLEL_SIZE } from './uploadAdmission';

test('沒有任何檔案在上傳時，一定會被接受', () => {
    expect(canAdmitFile(0, 0)).toBe(true);
});

test('admission 只看目前已保留的位元組是否已超過上限，不會把即將加入的新檔案大小算進去', () => {
    // 已保留 90MB（1 個檔案在傳），還沒超過 100MB 上限 → 即使接下來要加入的檔案本身很大，仍判定可接受
    expect(canAdmitFile(1, 90 * 1024 * 1024)).toBe(true);
});

test('一旦已保留位元組超過上限，才會拒絕新檔案', () => {
    // 累計 110MB，已超過 100MB 上限
    expect(canAdmitFile(2, 110 * 1024 * 1024)).toBe(false);
});

test('已保留位元組剛好等於上限時仍允許（邊界）', () => {
    expect(canAdmitFile(1, MAX_PARALLEL_SIZE)).toBe(true);
});

test('釋放後，已保留位元組回到上限內，超標狀態也會恢復', () => {
    expect(canAdmitFile(2, 110 * 1024 * 1024)).toBe(false);
    expect(canAdmitFile(1, 50 * 1024 * 1024)).toBe(true);
});

test('檔案數達到 16 上限時，即使位元組預算充足也拒絕', () => {
    expect(canAdmitFile(MAX_PARALLEL_FILES, 16 * 1024)).toBe(false);
    expect(canAdmitFile(MAX_PARALLEL_FILES - 1, 16 * 1024)).toBe(true);
});

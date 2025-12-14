/**
 * 驗證 ID 是否為有效的數字或 UUID 格式
 * @param {string|number} id - 要驗證的 ID
 * @returns {boolean} - 如果是有效的 ID 格式則返回 true
 */
export const isValidId = (id) => {
    if (id === null || id === undefined) {
        return false;
    }

    const strId = String(id);

    // 檢查是否為數字 ID
    if (/^\d+$/.test(strId)) {
        return true;
    }

    // 檢查是否為 UUID 格式 (支持有或無連字符的格式)
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    if (uuidRegex.test(strId)) {
        return true;
    }

    return false;
};

/**
 * 將 ID 轉換為標準格式
 * @param {string|number} id - 要轉換的 ID
 * @returns {string} - 轉換後的 ID 字串
 */
export const normalizeId = (id) => {
    return String(id).trim();
};

export default {
    isValidId,
    normalizeId,
};

import apiClient, { handleApiError } from '@/services/apiClient';
import apiConfig from '@/config/api';

// Battle Cat 查詢服務（GET 版）
class BattleCatService {
    /**
     * 依章節與敵人名稱查詢關卡（GET with params，enemies 重複鍵無 []）
     * @param {{ chapter: string, enemies: string[] }} params
     */
    async findLevel({ chapter, enemies }) {
        try {
            const trimmed = (enemies || []).map(e => (e || '').trim()).filter(Boolean);
            const qs = new URLSearchParams();
            if (chapter) qs.append('stage', chapter);
            trimmed.forEach(e => qs.append('enemy', e));

            const url = `${apiConfig.ENDPOINTS.BATTLE_CAT.FIND_LEVEL}?${qs.toString()}`;
            const { data } = await apiClient.get(url);

            // 後端若回傳 JSON 字串，需解析；若已是物件陣列，直接回傳
            return typeof data === 'string' ? JSON.parse(data) : data;
        } catch (error) {
            const handled = handleApiError(error, '查詢關卡失敗');
            throw handled;
        }
    }
}

const battleCatService = new BattleCatService();
export default battleCatService;

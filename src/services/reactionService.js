import apiClient, { handleApiError } from './apiClient';
import apiConfig from '@/config/api';

class ReactionService {
  static REACTION_TYPES = {
    LIKE: 'like',
    LOVE: 'love',
    HAHA: 'haha',
    WOW: 'wow',
    SAD: 'sad',
    ANGRY: 'angry',
    CARE: 'care',
  };

  static REACTION_INFO = [
    { type: 'like', emoji: '👍', label: '讚' },
    { type: 'love', emoji: '❤️', label: '愛心' },
    { type: 'haha', emoji: '😆', label: '哈哈' },
    { type: 'wow', emoji: '😮', label: '驚訝' },
    { type: 'sad', emoji: '😢', label: '難過' },
    { type: 'angry', emoji: '😠', label: '生氣' },
    { type: 'care', emoji: '🤗', label: '關心' },
  ];

  async addReactionToPost(postId, type) {
    try {
      const url = apiConfig.ENDPOINTS.REACTIONS.ADD_TO_POST.replace(':id', postId);
      console.log('[ReactionService] Adding reaction to post:', { postId, type, url });
      const response = await apiClient.post(url, { type });

      console.log('[ReactionService] Response received:', response.data);
      // 轉換 API 響應格式
      const data = this._normalizeReactionResponse(response.data);
      return { success: true, data };
    } catch (error) {
      console.error('[ReactionService] Error adding reaction to post:', { postId, type, error: error.message, status: error.response?.status, data: error.response?.data });
      return handleApiError(error, '反應失敗');
    }
  }

  async addReactionToComment(commentId, type) {
    try {
      // 後端路由：/api/comments/:comment_id/reactions
      // 使用 comment_id 作為參數名
      const url = apiConfig.ENDPOINTS.REACTIONS.ADD_TO_COMMENT.replace(':id', commentId);
      console.log('[ReactionService] Adding reaction to comment:', { commentId, type, url });
      const response = await apiClient.post(url, { type });

      console.log('[ReactionService] Response received:', response.data);
      // 轉換 API 響應格式
      const data = this._normalizeReactionResponse(response.data);
      return { success: true, data };
    } catch (error) {
      console.error('[ReactionService] Error adding reaction to comment:', { commentId, type, error: error.message, status: error.response?.status, data: error.response?.data });
      return handleApiError(error, '反應失敗');
    }
  }

  async getPostReactions(postId) {
    try {
      const url = apiConfig.ENDPOINTS.REACTIONS.GET_POST_REACTIONS.replace(':id', postId);
      console.log('[ReactionService] Fetching post reactions:', { postId, url });
      const response = await apiClient.get(url);

      console.log('[ReactionService] Reactions data received:', response.data);
      // 轉換 API 響應格式
      const data = this._normalizeReactionResponse(response.data);
      return { success: true, data };
    } catch (error) {
      console.error('[ReactionService] Error fetching post reactions:', { postId, error: error.message, status: error.response?.status, data: error.response?.data });
      return handleApiError(error, '取得反應統計失敗');
    }
  }

  async getCommentReactions(commentId) {
    try {
      // 後端路由：/api/comments/:comment_id/reactions
      const url = apiConfig.ENDPOINTS.REACTIONS.GET_COMMENT_REACTIONS.replace(':id', commentId);
      console.log('[ReactionService] Fetching comment reactions:', { commentId, url });
      const response = await apiClient.get(url);

      console.log('[ReactionService] Reactions data received:', response.data);
      // 轉換 API 響應格式
      const data = this._normalizeReactionResponse(response.data);
      return { success: true, data };
    } catch (error) {
      console.error('[ReactionService] Error fetching comment reactions:', { commentId, error: error.message, status: error.response?.status, data: error.response?.data });
      return handleApiError(error, '取得反應統計失敗');
    }
  }

  /**
   * 標準化 API 響應格式
   * 將 reactions_summary 對象格式轉換為 reactions 陣列格式
   * @param {Object} apiData - API 返回的原始數據
   * @returns {Object} 標準化的數據格式 { reactions: Array, user_reaction: Object|null }
   */
  _normalizeReactionResponse(apiData) {
    console.log('[ReactionService] Normalizing API response:', apiData);

    if (!apiData) {
      console.warn('[ReactionService] Null or undefined API data');
      return { reactions: [], user_reaction: null };
    }

    // 如果已經是正確格式（reactions 陣列），直接返回
    if (Array.isArray(apiData.reactions)) {
      console.log('[ReactionService] Response already in array format');
      return {
        reactions: apiData.reactions,
        user_reaction: apiData.user_reaction || null,
      };
    }

    // 如果是 reactions_summary 對象格式，轉換為陣列
    if (apiData.reactions_summary && typeof apiData.reactions_summary === 'object') {
      console.log('[ReactionService] Converting reactions_summary to array format');
      const reactions = Object.entries(apiData.reactions_summary).map(([type, count]) => ({
        type,
        count,
      }));

      // 如果有 reaction 字段表示用戶當前的反應（添加/移除時返回）
      // 如果有 user_reaction 字段（獲取列表時返回）
      let userReaction = null;
      if (apiData.reaction) {
        userReaction = { type: apiData.reaction.type || apiData.reaction };
      } else if (apiData.user_reaction) {
        userReaction = { type: apiData.user_reaction.type || apiData.user_reaction };
      }

      console.log('[ReactionService] Normalized reactions:', { reactions, userReaction });
      return {
        reactions,
        user_reaction: userReaction,
      };
    }

    // 默認返回空響應
    console.warn('[ReactionService] No recognized format found in API response');
    return {
      reactions: [],
      user_reaction: null,
    };
  }
  getReactionEmoji(type) {
    const reaction = ReactionService.REACTION_INFO.find(r => r.type === type);
    return reaction ? reaction.emoji : '❓';
  }

  getReactionLabel(type) {
    const reaction = ReactionService.REACTION_INFO.find(r => r.type === type);
    return reaction ? reaction.label : '未知';
  }
}

const reactionService = new ReactionService();
export default reactionService;
export { ReactionService };

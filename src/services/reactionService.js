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
      const response = await apiClient.post(url, { type });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, '反應失敗');
    }
  }

  async addReactionToComment(commentId, type) {
    try {
      const url = apiConfig.ENDPOINTS.REACTIONS.ADD_TO_COMMENT.replace(':id', commentId);
      const response = await apiClient.post(url, { type });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, '反應失敗');
    }
  }

  async getPostReactions(postId) {
    try {
      const url = apiConfig.ENDPOINTS.REACTIONS.GET_POST_REACTIONS.replace(':id', postId);
      const response = await apiClient.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, '取得反應統計失敗');
    }
  }

  async getCommentReactions(commentId) {
    try {
      const url = apiConfig.ENDPOINTS.REACTIONS.GET_COMMENT_REACTIONS.replace(':id', commentId);
      const response = await apiClient.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, '取得反應統計失敗');
    }
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

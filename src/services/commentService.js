import apiClient, { handleApiError } from './apiClient';
import apiConfig from '@/config/api';

class CommentService {
  async getComments(postId) {
    try {
      const url = apiConfig.ENDPOINTS.COMMENTS.LIST.replace(':id', postId);
      const response = await apiClient.get(url);
<<<<<<< HEAD
      console.log('[Debug] select comments:', response.data);
=======
>>>>>>> upstream/golang-programing-class
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, '取得留言失敗');
    }
  }

  async createComment(postId, commentData) {
    try {
      const url = apiConfig.ENDPOINTS.COMMENTS.CREATE.replace(':id', postId);
<<<<<<< HEAD
      console.log('[CommentService] Creating comment:', { postId, url, commentData });
      const response = await apiClient.post(url, commentData);
      console.log('[CommentService] Comment created successfully:', response.data);
      return { success: true, data: response.data, message: commentData.parent_id ? '回覆成功' : '留言成功' };
    } catch (error) {
      console.error('[CommentService] Error creating comment:', { postId, error: error.message, status: error.response?.status, data: error.response?.data });
=======
      const response = await apiClient.post(url, commentData);
      return { success: true, data: response.data, message: commentData.parent_id ? '回覆成功' : '留言成功' };
    } catch (error) {
>>>>>>> upstream/golang-programing-class
      return handleApiError(error, '留言失敗');
    }
  }

  async updateComment(commentId, updates) {
    try {
      const url = apiConfig.ENDPOINTS.COMMENTS.UPDATE.replace(':id', commentId);
      const response = await apiClient.put(url, updates);
      return { success: true, data: response.data, message: '留言更新成功' };
    } catch (error) {
      return handleApiError(error, '更新留言失敗');
    }
  }

  async deleteComment(commentId) {
    try {
      const url = apiConfig.ENDPOINTS.COMMENTS.DELETE.replace(':id', commentId);
      const response = await apiClient.delete(url);
      return { success: true, data: response.data, message: '留言刪除成功' };
    } catch (error) {
      return handleApiError(error, '刪除留言失敗');
    }
  }

  buildCommentTree(comments) {
    const commentMap = new Map();
    const roots = [];

    comments.forEach(comment => {
      commentMap.set(comment.ID, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      const commentNode = commentMap.get(comment.ID);
<<<<<<< HEAD
      const parentId = comment.ParentID || comment.parent_id;

      if (parentId) {
        const parent = commentMap.get(parentId);
=======
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
>>>>>>> upstream/golang-programing-class
        if (parent) {
          parent.replies.push(commentNode);
        } else {
          roots.push(commentNode);
        }
      } else {
        roots.push(commentNode);
      }
    });

    return roots;
  }
}

const commentService = new CommentService();
export default commentService;

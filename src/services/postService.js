import apiClient, { handleApiError } from './apiClient';
import apiConfig from '@/config/api';

class PostService {
  async getPosts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${apiConfig.ENDPOINTS.POSTS.LIST}${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, '取得文章列表失敗');
    }
  }

  async getPost(id) {
    try {
      const url = apiConfig.ENDPOINTS.POSTS.GET.replace(':id', id);
      const response = await apiClient.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, '取得文章失敗');
    }
  }

  async createPost(postData) {
    try {
      const response = await apiClient.post(apiConfig.ENDPOINTS.POSTS.CREATE, postData);
      return { success: true, data: response.data, message: '文章建立成功' };
    } catch (error) {
      return handleApiError(error, '建立文章失敗');
    }
  }

  async updatePost(id, updates) {
    try {
      const url = apiConfig.ENDPOINTS.POSTS.UPDATE.replace(':id', id);
      const response = await apiClient.put(url, updates);
      return { success: true, data: response.data, message: '文章更新成功' };
    } catch (error) {
      return handleApiError(error, '更新文章失敗');
    }
  }

  async deletePost(id) {
    try {
      const url = apiConfig.ENDPOINTS.POSTS.DELETE.replace(':id', id);
      const response = await apiClient.delete(url);
      return { success: true, data: response.data, message: '文章刪除成功' };
    } catch (error) {
      return handleApiError(error, '刪除文章失敗');
    }
  }
}

const postService = new PostService();
export default postService;

import api from './api';

export const userService = {
  getMe: async () => {
    return api.get('/users/me');
  },
  getPublicProfile: async (identifier) => {
    try {
      const response = await api.get(`/users/public/${identifier}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  blockUser: async (targetUserId) => {
    return api.post('/users/me/block', { targetUserId });
  },
  unblockUser: async (targetUserId) => {
    return api.post('/users/me/unblock', { targetUserId });
  }
};

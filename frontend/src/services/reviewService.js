import api from './api';

export const reviewService = {
  getUserReviews: async (userId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/reviews/user/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createReview: async (reviewData) => {
    return api.post('/reviews', reviewData);
  }
};

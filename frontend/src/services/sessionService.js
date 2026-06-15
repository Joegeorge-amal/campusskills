import api from './api';

export const sessionService = {
  getSessions: async (filters = {}) => {
    return api.get('/sessions/me', { params: filters });
  },

  createSession: async (sessionData) => {
    return api.post('/sessions/create', sessionData);
  },

  bookSession: async (sessionId, slot) => {
    return api.post(`/sessions/${sessionId}/book`, { slot });
  },

  reportSession: async (sessionId, reportData) => {
    return api.post(`/sessions/${sessionId}/report`, reportData);
  },

  rateSession: async (sessionId, rating, reviewText) => {
    return api.post(`/sessions/${sessionId}/rate`, { rating, review: reviewText });
  }
};

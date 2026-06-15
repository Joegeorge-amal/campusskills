import api from './api';

export const sessionService = {
  getSessions: async (filters = {}) => {
    const response = await api.get('/sessions/me', { params: filters });
    return response.data;
  },

  createSession: async (sessionData) => {
    const response = await api.post('/sessions/create', sessionData);
    return response.data;
  },

  bookSession: async (sessionId, slot) => {
    const response = await api.post(`/sessions/${sessionId}/book`, { slot });
    return response.data;
  },

  rateSession: async (sessionId, rating, reviewText) => {
    const response = await api.post(`/sessions/${sessionId}/rate`, { rating, review: reviewText });
    return response.data;
  },

  markCompletion: async (sessionId) => {
    const response = await api.post(`/sessions/${sessionId}/complete`);
    return response.data;
  },

  proposeReschedule: async (sessionId, newStart, newEnd) => {
    const response = await api.post(`/sessions/${sessionId}/reschedule/propose`, { newStart, newEnd });
    return response.data;
  },

  respondToReschedule: async (sessionId, accept) => {
    const response = await api.post(`/sessions/${sessionId}/reschedule/respond`, { accept });
    return response.data;
  },

  markPaid: async (sessionId) => {
    const response = await api.post(`/sessions/${sessionId}/pay`);
    return response.data;
  },

  getPaymentInfo: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}/payment-info`);
    return response.data;
  },

  cancelSession: async (sessionId, reason) => {
    const response = await api.post(`/sessions/${sessionId}/cancel`, { reason });
    return response.data;
  }
};

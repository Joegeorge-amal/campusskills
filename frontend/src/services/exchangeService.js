import api from './api';

export const exchangeService = {
  createExchange: async (exchangeData) => {
    // exchangeData expected: { listingId, type: 'BOOKING' | 'SWAP', proposedSessions: [{ startTime, endTime, topic }], message }
    const response = await api.post('/exchanges', exchangeData);
    return response.data;
  },
  
  getMyExchanges: async () => {
    const response = await api.get('/exchanges/me');
    return response.data;
  },

  acceptExchange: async (id, payload = {}) => {
    const response = await api.post(`/exchanges/${id}/accept`, payload);
    return response.data;
  },

  rejectExchange: async (id) => {
    const response = await api.post(`/exchanges/${id}/reject`);
    return response.data;
  },

  cancelExchange: async (id) => {
    const response = await api.post(`/exchanges/${id}/cancel`);
    return response.data;
  }
};

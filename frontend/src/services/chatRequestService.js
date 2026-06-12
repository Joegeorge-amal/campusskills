import api from './api';

export const chatRequestService = {
  createRequest: async (requestData) => {
    // requestData expected: { receiverId, message }
    const response = await api.post('/chat-requests', requestData);
    return response.data;
  },
  
  getUserRequests: async () => {
    const response = await api.get('/chat-requests');
    return response.data;
  },

  acceptRequest: async (id) => {
    const response = await api.patch(`/chat-requests/${id}/accept`);
    return response.data;
  },

  rejectRequest: async (id) => {
    const response = await api.patch(`/chat-requests/${id}/reject`);
    return response.data;
  }
};

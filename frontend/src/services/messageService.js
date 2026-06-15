import api from './api';

export const messageService = {
  getMessages: async (chatId, params = {}) => {
    const response = await api.get(`/messages/chat/${chatId}`, { params });
    return response.data;
  },

  sendMessage: async (chatId, message, replyToMessageId = null, tempId = null) => {
    const payload = { chatId, message };
    if (replyToMessageId) {
      payload.replyToMessageId = replyToMessageId;
    }
    if (tempId) {
      payload.tempId = tempId;
    }
    const response = await api.post('/messages', payload);
    return response.data;
  },

  markAsRead: async (chatId) => {
    const response = await api.patch(`/messages/chat/${chatId}/read`);
    return response.data;
  },

  editMessage: async (messageId, message) => {
    const response = await api.patch(`/messages/${messageId}/edit`, { message });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  }
};

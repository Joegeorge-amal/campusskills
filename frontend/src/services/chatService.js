import api from './api';

export const chatService = {
  getUserChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },
  createChat: async (chatData) => {
    const response = await api.post('/chats', chatData);
    return response.data;
  },
  deleteChat: async (chatId) => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  }
};

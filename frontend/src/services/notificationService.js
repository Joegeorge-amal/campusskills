import api from './api';

const notificationService = {
  getNotifications: async (params) => {
    const response = await api.get('/notifications/', { params });
    return response.data;
  },
  getUnreadNotifications: async (params) => {
    const response = await api.get('/notifications/unread', { params });
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};

export default notificationService;

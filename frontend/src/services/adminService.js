import api from './api';

const adminService = {
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  getDisputes: async (params) => {
    const response = await api.get('/admin/disputes', { params });
    return response.data;
  },

  updateDisputeStatus: async (disputeId, updateData) => {
    // updateData should include { status, resolutionType, adminNotes }
    const response = await api.patch(`/admin/disputes/${disputeId}`, updateData);
    return response.data;
  },

  forceCompleteSession: async (sessionId) => {
    const response = await api.post(`/admin/sessions/${sessionId}/force-complete`);
    return response.data;
  },

  getSessions: async (params) => {
    const response = await api.get('/admin/sessions', { params });
    return response.data;
  },

  cancelSession: async (sessionId, reason) => {
    const response = await api.patch(`/admin/sessions/${sessionId}/cancel`, { reason });
    return response.data;
  },

  getListings: async (params) => {
    const response = await api.get('/admin/listings', { params });
    return response.data;
  },

  getAnalyticsData: async (params) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data;
  },

  updateListingStatus: async (listingId, status) => {
    const response = await api.patch(`/admin/listings/${listingId}/status`, { status });
    return response.data;
  },

  getNotifications: async (params) => {
    const response = await api.get('/admin/notifications', { params });
    return response.data;
  },

  markNotificationsRead: async (id = null) => {
    const payload = id ? { id } : {};
    const response = await api.patch('/admin/notifications/read', payload);
    return response.data;
  },

  getOverview: async () => {
    const response = await api.get('/admin/overview');
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  }
};

export default adminService;

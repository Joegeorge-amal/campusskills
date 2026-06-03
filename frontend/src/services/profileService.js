import api from './api';

export const profileService = {
  getMe: () => api.get('/profiles/me'),
  updateMe: (data) => api.patch('/profiles/me', data),
  getProfile: (userId) => api.get(`/profiles/${userId}`)
};

import api from './api';

export const userService = {
  getProfile: async () => {
    return api.get('/users/profile');
  },

  updateProfile: async (profileData) => {
    return api.put('/users/update', profileData);
  },

  uploadAvatar: async (formData) => {
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  updateAvatarColor: async (bg, col) => {
    return api.patch('/users/avatar-color', { bg, col });
  }
};

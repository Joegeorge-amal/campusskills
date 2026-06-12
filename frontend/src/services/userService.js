import api from './api';

export const userService = {
  getMe: async () => {
    return api.get('/users/me');
  },
  getPublicProfile: async (rollNo) => {
    return api.get(`/users/public/${rollNo}`);
  }
};

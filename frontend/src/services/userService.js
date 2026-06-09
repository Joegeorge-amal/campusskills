import api from './api';

export const userService = {
  getMe: async () => {
    return api.get('/users/me');
  }
};

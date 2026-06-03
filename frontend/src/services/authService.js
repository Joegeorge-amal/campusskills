import api from './api';

export const authService = {
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  register: async (email, password, displayName) => {
    return api.post('/auth/signup', { email, password, displayName });
  },

  refresh: async (refreshToken) => {
    return api.post('/auth/refresh', { refreshToken });
  }
};

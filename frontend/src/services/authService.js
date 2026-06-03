import api from './api';

export const authService = {
  login: async (email, password, role) => {
    return api.post('/auth/login', { email, password, role });
  },

  register: async (studentData) => {
    return api.post('/auth/register', studentData);
  },

  verifyToken: async () => {
    return api.get('/auth/verify');
  },

  googleLogin: async (tokenId) => {
    return api.post('/auth/google', { token: tokenId });
  }
};

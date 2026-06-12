import api from './api';

export const authService = {
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  register: async (email, password, name) => {
    return api.post('/auth/signup', { email, password, name });
  },

  refresh: async (refreshToken) => {
    return api.post('/auth/refresh', { refreshToken });
  },

  logout: async (refreshToken) => {
    return api.post('/auth/logout', { refreshToken });
  },

  googleLogin: async (tokenId) => {
    return api.post('/auth/google', { token: tokenId });
  },

  verifyEmail: async (otp) => {
    return api.post('/users/me/verify-email', { otp });
  },

  resendOtp: async () => {
    return api.post('/users/me/resend-otp');
  },

  verify2FA: async (otp) => {
    return api.post('/users/me/verify-2fa', { otp });
  },

  resend2FA: async () => {
    return api.post('/users/me/resend-2fa-otp');
  },

  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  verifyResetOtp: async (email, otp) => {
    return api.post('/auth/verify-reset-otp', { email, otp });
  },

  resetPassword: async (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword });
  }
};

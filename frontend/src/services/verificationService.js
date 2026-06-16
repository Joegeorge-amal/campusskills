import api from './api';

export const verificationService = {
  getQuestions: async (skill) => {
    try {
      const response = await api.get(`/verifications/questions/${encodeURIComponent(skill)}`);
      return response.data; // array of questions
    } catch (error) {
      throw error;
    }
  },

  submitVerification: async (payload) => {
    try {
      const response = await api.post('/verifications/submit', payload);
      return response.data; // The SkillVerification record
    } catch (error) {
      throw error;
    }
  }
};

import api from './api';

export const reportService = {
  createReport: async (reportData) => {
    return api.post('/reports/', reportData);
  }
};

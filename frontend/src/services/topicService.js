import api from './api';

export const getTopics = async () => {
  return await api.get('/topics');
};

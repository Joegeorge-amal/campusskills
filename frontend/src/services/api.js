import axios from 'axios';

// Create central API client pointing to your Java Vert.x back-end relative API endpoint
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10s timeout limit
});

// Request Interceptor: Attach JWT Token if available in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle central server/authorization errors
api.interceptors.response.use(
  (response) => {
    return response.data; // Simplify response data extraction across services
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.error('[API] JWT Token expired or unauthorized. Redirecting to login...');
        localStorage.clear();
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('[API] You do not have permissions to perform this action.');
      } else if (status === 500) {
        console.error('[API] Vert.x backend server encountered an error.');
      }
    } else {
      console.error('[API] Network error or timeout. Verify server is online.');
    }
    return Promise.reject(error);
  }
);

export default api;

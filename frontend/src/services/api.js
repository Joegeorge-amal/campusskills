import axios from 'axios';

// Create central API client pointing to your Java Vert.x back-end relative API endpoint
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30s timeout limit
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
        console.error('[API] JWT Token expired or unauthorized.');
        localStorage.clear();
        
        // Only redirect if we are not already on an auth page, to prevent infinite reloads 
        // when submitting invalid credentials on the login page itself
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/setup' && path !== '/') {
          window.location.href = '/login';
        }
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

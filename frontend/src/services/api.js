import axios from 'axios';

// Create central API client pointing to your Java Vert.x back-end relative API endpoint
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
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
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;

      if (status === 401 && !originalRequest._retry) {
        if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/refresh') {
          return Promise.reject(error);
        }

        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('cs_refresh_token');
        
        if (refreshToken) {
          try {
            // Avoid circular dependency by making a direct axios call
            const refreshResponse = await axios.post((import.meta.env.VITE_API_URL || '/api/v1') + '/auth/refresh', {
              refreshToken
            });
            
            const { token, refreshToken: newRefreshToken } = refreshResponse.data.data || refreshResponse.data;
            
            if (!token) {
              throw new Error("No token returned from refresh endpoint");
            }
            
            localStorage.setItem('cs_token', token);
            if (newRefreshToken) {
              localStorage.setItem('cs_refresh_token', newRefreshToken);
            }
            
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.error('[API] Refresh token expired or invalid. Redirecting to login...');
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else {
          console.error('[API] No refresh token found. Redirecting to login...');
          localStorage.clear();
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

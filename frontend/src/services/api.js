import axios from 'axios';

// Create central API client pointing to your Java Vert.x back-end relative API endpoint
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle central server/authorization errors and silent refresh
api.interceptors.response.use(
  (response) => {
    return response.data; // Simplify response data extraction across services
  },
  (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;

      if (status === 401 && !originalRequest._retry) {
        if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/refresh' || originalRequest.url === '/api/v1/auth/login' || originalRequest.url === '/api/v1/auth/refresh') {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('cs_refresh_token');
        
        if (!refreshToken) {
          isRefreshing = false;
          console.error('[API] JWT Token expired and no refresh token available.');
          localStorage.clear();
          const path = window.location.pathname;
          if (path !== '/login' && path !== '/setup' && path !== '/') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        return new Promise(function (resolve, reject) {
          const baseURL = import.meta.env.VITE_API_URL || '/api/v1';
          axios.post(`${baseURL}/auth/refresh`, { refreshToken }, {
            headers: { 'Content-Type': 'application/json' }
          })
            .then(({ data }) => {
              const resData = data.data || data;
              const newToken = resData.token;
              const newRefresh = resData.refreshToken;
              
              if (newToken) {
                localStorage.setItem('cs_token', newToken);
                if (newRefresh) {
                  localStorage.setItem('cs_refresh_token', newRefresh);
                }
                
                window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: newToken }));
                
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                processQueue(null, newToken);
                resolve(api(originalRequest));
              } else {
                throw new Error("Invalid token format from refresh");
              }
            })
            .catch((err) => {
              processQueue(err, null);
              console.error('[API] Refresh token request failed:', err);
              
              // Only clear local storage and redirect if it's a definitive 400 or 401 client error
              const isSessionExpired = err.response && (err.response.status === 400 || err.response.status === 401);
              
              if (isSessionExpired) {
                console.warn('[API] Session expired or invalid. Logging out.');
                localStorage.clear();
                const path = window.location.pathname;
                if (path !== '/login' && path !== '/setup' && path !== '/') {
                  window.location.href = '/login';
                }
              }
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      } else if (status === 401) {
        console.error('[API] Unauthorized despite retry.');
        localStorage.clear();
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

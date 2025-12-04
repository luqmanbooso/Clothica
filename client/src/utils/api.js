import axios from 'axios';

// Create axios instance with default configuration
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8087';
console.log('API Base URL:', baseURL); // Debug log

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 API Request with token:', config.url, token.substring(0, 20) + '...');
    } else {
      console.log('🔑 API Request without token:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🚨 401 Error on:', error.config?.url, 'Current path:', window.location.pathname);
      
      // Token expired or invalid
      localStorage.removeItem('token');
      
      // Only redirect if not already on login page and not during auth operations
      if (window.location.pathname !== '/login' && 
          window.location.pathname !== '/register' &&
          !error.config?.url?.includes('/auth/')) {
        console.log('🔄 Redirecting to login due to 401 error');
        // Store the current path for post-login redirect
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login';
      } else {
        console.log('⏭️ Skipping redirect - on auth page or during auth operation');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

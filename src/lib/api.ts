// lib/api.ts
import axios from 'axios';

// Use VITE_API_BASE_URL for production, empty for development (Vite proxy)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies to be sent with requests
});

// Request interceptor - cookies are automatically sent with withCredentials: true
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically included with withCredentials: true
    // No need to manually add Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors - let AuthContext handle logout
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Instead of trying to refresh tokens, reject the promise
      // The AuthContext will catch this and handle logout appropriately
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

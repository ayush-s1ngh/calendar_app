import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { AuthTokens } from '../types';

// Create axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('auth_tokens');
    if (tokens) {
      const parsedTokens: AuthTokens = JSON.parse(tokens);
      // Modern way to set headers in Axios v1+
      config.headers.set('Authorization', `Bearer ${parsedTokens.access_token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If error is 401 and it's not a retry, handle auth error
    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        // Token refresh could be implemented here
        // For now, just redirect to login if token is invalid
        localStorage.removeItem('auth_tokens');
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        localStorage.removeItem('auth_tokens');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
import axios, { isAxiosError } from 'axios';
import { useAuthStore } from '@/lib/stores/auth-store';

/**
 * Base URL for all REST API calls made by the frontend.
 *
 * Configured via Vite environment variables (.env).
 * Fallbacks to localhost for local development environments.
 *
 * @constant {string} API_URL
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Shared, pre-configured Axios HTTP client instance.
 * All frontend requests to the MIVA Study League backend should use this instance.
 *
 * @type {import('axios').AxiosInstance}
 *
 * @property {string} baseURL - Set to the VITE_API_URL
 * @property {number} timeout - Aborts requests taking longer than 15,000ms
 * @property {boolean} withCredentials - Crucial for sending/receiving HttpOnly cookies (like Refresh tokens)
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Global Request Interceptor
 *
 * Automatically intercepts every outgoing request and injects the
 * current JWT Access Token into the Authorization header.
 *
 * @function
 * @param {import('axios').InternalAxiosRequestConfig} config - The incoming Axios request configuration
 * @returns {import('axios').InternalAxiosRequestConfig} The modified configuration with Auth headers
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> =
  [];

/**
 * Processes the queue of suspended requests once a new token is fetched.
 *
 * @param {Error|null} error - The error if the token refresh failed
 * @param {string|null} token - The newly acquired JWT access token
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Global Response Interceptor
 *
 * Implements an automatic silent token refresh mechanism.
 * If any API call fails with a 401 Unauthorized status, this interceptor pauses it,
 * attempts to silently fetch a new access token using the HttpOnly refresh cookie,
 * updates the Zustand store, and seamlessly replays the original request.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth')
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((error) => {
            return Promise.reject(error);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The backend uses an HttpOnly cookie for the refresh token, so the browser
        // automatically attaches it via `withCredentials: true`. No body payload is needed!
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        
        const newAccessToken = data.token || data.accessToken || data.data?.accessToken;
        
        // We leave the refreshToken empty here because the backend handles it via res.cookie
        useAuthStore.getState().setTokens(newAccessToken, '');

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (error) {
        processQueue(error as Error, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Extracts a safe error message string from an unknown caught error.
 */
export const getApiError = (error: unknown, defaultMessage = 'An unexpected error occurred'): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

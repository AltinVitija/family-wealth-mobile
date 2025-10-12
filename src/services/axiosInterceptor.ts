import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from 'src/store';
import { logout, refreshTokenSuccess } from 'src/store/slices/auth/authSlice';
import { API_URL } from './api';

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

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

// Request interceptor - Add token to all requests
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh on 401
axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid refreshing for login/register endpoints
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = store.getState().auth.refreshToken;

      if (!refreshToken) {
        // No refresh token available - logout
        console.log('No refresh token available - logging out');
        store.dispatch(logout());
        processQueue(new Error('No refresh token'), null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        console.log(' Attempting to refresh token...');

        // Attempt to refresh the token
        const response = await axios.post(`${API_URL}auth/refresh`, {
          refreshToken,
        });

        //  FIXED: Validate response format before accessing data
        if (!response.data.success || !response.data.data) {
          throw new Error('Invalid refresh response format');
        }

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        if (!accessToken) {
          throw new Error('No access token in refresh response');
        }

        console.log(' Token refresh successful');

        // Update tokens in Redux store
        store.dispatch(
          refreshTokenSuccess({
            accessToken,
            refreshToken: newRefreshToken || refreshToken,
          })
        );

        // Process queued requests with new token
        processQueue(null, accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        isRefreshing = false;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed - token is expired, logout user
        console.log('Token refresh failed - logging out', refreshError);
        processQueue(refreshError as Error, null);
        store.dispatch(logout());
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;

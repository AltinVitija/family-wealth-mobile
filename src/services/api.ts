// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshAccessToken } from './auth/refreshToken.services';

// Dynamically select the right API URL
const getApiUrl = () => {
  // For physical device on same WiFi network
  // Change this IP to match your computer's local IP
  return `http://192.168.1.66:8080/api/v1/`;

  // Uncomment for Android Emulator:
  // return 'http://10.0.2.2:8080/api/v1/';

  // Uncomment for iOS Simulator:
  // return 'http://localhost:8080/api/v1/';
};

export const API_URL = getApiUrl();

console.log('🔌 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - auto-refresh on 401
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log the error for debugging
    if (error.response) {
      console.error(`❌ ${error.response.status} ${originalRequest?.url}`);
    } else if (error.request) {
      console.error('❌ Network Error - No response received');
      console.error('Request URL:', originalRequest?.url);
    } else {
      console.error('❌ Error:', error.message);
    }

    // If 401 and haven't retried yet, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { accessToken } = await refreshAccessToken();

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        console.log('🔄 Token refreshed, retrying request...');
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens
        console.error('❌ Token refresh failed');
        await AsyncStorage.multiRemove(['token', 'refreshToken']);
        // You might want to dispatch a logout action here or navigate to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

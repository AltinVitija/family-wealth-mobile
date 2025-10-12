// services/auth/login.services.ts - FIXED VERSION
import axios from 'axios';
import { storeData } from '../storage/asyncStorage';
import { API_URL } from '../api';
import { LoginCredentials, LoginResponse } from 'src/types/user';

export const loginUser = async (loginCredentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // ✅ Backend now returns the correct format directly!
    const response = await axios.post<LoginResponse>(`${API_URL}auth/login`, loginCredentials);

    console.log('Backend Response:', response.data);

    // ✅ NO MAPPING NEEDED - backend returns correct format
    // Just store and return as-is
    await storeData({ key: 'token', value: response.data.accessToken });
    await storeData({ key: 'refreshToken', value: response.data.refreshToken });

    console.log('Tokens stored successfully');
    return response.data;
  } catch (error) {
    console.error('Login Error:', error);

    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error || error.response.data.message || 'Authentication failed';
      throw new Error(errorMsg);
    }
    throw new Error('Authentication failed');
  }
};

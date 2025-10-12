// services/auth/refreshToken.services.ts
import axios from 'axios';
import { API_URL } from '../api';
import { storeData, getData } from '../storage/asyncStorage';

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const refreshAccessToken = async (): Promise<RefreshTokenResponse> => {
  try {
    const refreshToken = await getData('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await axios.post<RefreshTokenResponse>(`${API_URL}refresh-token`, {
      refreshToken,
    });

    // Store new tokens
    await storeData({ key: 'token', value: response.data.accessToken });
    await storeData({ key: 'refreshToken', value: response.data.refreshToken });

    return response.data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw new Error('Failed to refresh token');
  }
};

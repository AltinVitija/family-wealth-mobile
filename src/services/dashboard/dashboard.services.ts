import axios from 'axios';
import { API_URL } from '../api';
import { store } from 'src/store';
import { DashboardData, DashboardApiResponse } from 'src/types/dashboard';

const getAuthHeader = () => {
  const token = store.getState().auth.token;
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// @desc Get full dashboard data
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<DashboardApiResponse<DashboardData>>(`${API_URL}dashboard`, {
      headers,
    });

    console.log('Get Dashboard Data Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch dashboard data');
  } catch (error) {
    console.error('Get Dashboard Data Error:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error?.message ||
        error.response.data.message ||
        'Failed to fetch dashboard data';
      throw new Error(errorMsg);
    }
    throw new Error('Failed to fetch dashboard data');
  }
};

// @desc Get dashboard overview data only (for quick load)
export const getDashboardOverview = async () => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<DashboardApiResponse>(`${API_URL}dashboard/overview`, {
      headers,
    });

    console.log('Get Dashboard Overview Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch overview');
  } catch (error) {
    console.error('Get Dashboard Overview Error:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error?.message ||
        error.response.data.message ||
        'Failed to fetch overview';
      throw new Error(errorMsg);
    }
    throw new Error('Failed to fetch overview');
  }
};

import axios from 'axios';
import { API_URL } from '../api';
import { store } from 'src/store';
import {
  EstatePlan,
  EstatePlanStats,
  CreateEstatePlanRequest,
  UpdateEstatePlanData,
  EstatePlanApiResponse,
} from 'src/types/estatePlan';

const getAuthHeader = () => {
  const token = store.getState().auth.token;
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// @desc Get all estate plans for user
export const getEstatePlans = async (): Promise<EstatePlan[]> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<EstatePlanApiResponse<EstatePlan[]>>(
      `${API_URL}estate-plans`,
      { headers }
    );

    console.log('Get Estate Plans Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch estate plans');
  } catch (error) {
    console.error('Get Estate Plans Error:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error?.message ||
        error.response.data.message ||
        'Failed to fetch estate plans';
      throw new Error(errorMsg);
    }
    throw new Error('Failed to fetch estate plans');
  }
};

// @desc Get single estate plan by ID
export const getEstatePlan = async (id: string): Promise<EstatePlan> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<EstatePlanApiResponse<EstatePlan>>(
      `${API_URL}estate-plans/${id}`,
      { headers }
    );

    console.log('Get Estate Plan Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch estate plan');
  } catch (error) {
    console.error('Get Estate Plan Error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Estate plan not found');
      }
      if (error.response?.data) {
        const errorMsg =
          error.response.data.error?.message ||
          error.response.data.message ||
          'Failed to fetch estate plan';
        throw new Error(errorMsg);
      }
    }
    throw new Error('Failed to fetch estate plan');
  }
};

// @desc Create new estate plan

export const createEstatePlan = async (data: CreateEstatePlanRequest): Promise<EstatePlan> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.post<EstatePlanApiResponse<EstatePlan>>(
      `${API_URL}estate-plans`,
      data,
      { headers }
    );

    console.log('Create Estate Plan Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to create estate plan');
  } catch (error) {
    console.error('Create Estate Plan Error:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error?.message ||
        error.response.data.message ||
        'Failed to create estate plan';
      throw new Error(errorMsg);
    }
    throw new Error('Failed to create estate plan');
  }
};

// @desc Update estate plan
export const updateEstatePlan = async (
  id: string,
  data: UpdateEstatePlanData
): Promise<EstatePlan> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.put<EstatePlanApiResponse<EstatePlan>>(
      `${API_URL}estate-plans/${id}`,
      data,
      { headers }
    );

    console.log('Update Estate Plan Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to update estate plan');
  } catch (error) {
    console.error('Update Estate Plan Error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Estate plan not found');
      }
      if (error.response?.data) {
        const errorMsg =
          error.response.data.error?.message ||
          error.response.data.message ||
          'Failed to update estate plan';
        throw new Error(errorMsg);
      }
    }
    throw new Error('Failed to update estate plan');
  }
};

// @desc Delete estate plan
export const deleteEstatePlan = async (id: string): Promise<void> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.delete<EstatePlanApiResponse>(`${API_URL}estate-plans/${id}`, {
      headers,
    });

    console.log('Delete Estate Plan Response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete estate plan');
    }
  } catch (error) {
    console.error('Delete Estate Plan Error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Estate plan not found');
      }
      if (error.response?.data) {
        const errorMsg =
          error.response.data.error?.message ||
          error.response.data.message ||
          'Failed to delete estate plan';
        throw new Error(errorMsg);
      }
    }
    throw new Error('Failed to delete estate plan');
  }
};

// @desc Get estate plan statistics
export const getEstatePlanStats = async (): Promise<EstatePlanStats> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<EstatePlanApiResponse<EstatePlanStats>>(
      `${API_URL}estate-plans/stats`,
      { headers }
    );

    console.log('Get Estate Plan Stats Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch estate plan stats');
  } catch (error) {
    console.error('Get Estate Plan Stats Error:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error?.message ||
        error.response.data.message ||
        'Failed to fetch estate plan stats';
      throw new Error(errorMsg);
    }
    throw new Error('Failed to fetch estate plan stats');
  }
};

import axios from 'axios';
import { API_URL } from '../api';
import { store } from 'src/store';
import {
  Goal,
  GoalWithProgress,
  GoalStats,
  CreateGoalRequest,
  UpdateGoalData,
  UpdateGoalProgressData,
  GoalApiResponse,
} from 'src/types/goals';

const getAuthHeader = () => {
  const token = store.getState().auth.token;
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// @desc Get all goals for user
export const getGoals = async (): Promise<Goal[]> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<GoalApiResponse<Goal[]>>(`${API_URL}goals`, { headers });

    console.log('Get Goals Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch goals');
  } catch (error) {
    console.error('Get Goals Error:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error?.message ||
        error.response.data.message ||
        'Failed to fetch goals';
      throw new Error(errorMsg);
    }
    throw new Error('Failed to fetch goals');
  }
};

// @desc Get single goal by ID
export const getGoal = async (id: string): Promise<GoalWithProgress> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<GoalApiResponse<GoalWithProgress>>(`${API_URL}goals/${id}`, {
      headers,
    });

    console.log('Get Goal Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch goal');
  } catch (error) {
    console.error('Get Goal Error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Goal not found');
      }
      if (error.response?.data) {
        const errorMsg =
          error.response.data.error?.message ||
          error.response.data.message ||
          'Failed to fetch goal';
        throw new Error(errorMsg);
      }
    }
    throw new Error('Failed to fetch goal');
  }
};

// @desc Create new goal
export const createGoal = async (data: CreateGoalRequest): Promise<Goal> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.post<GoalApiResponse<Goal>>(`${API_URL}goals`, data, { headers });

    console.log('Create Goal Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to create goal');
  } catch (error) {
    console.error('Create Goal Error:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error?.message ||
        error.response.data.message ||
        'Failed to create goal';
      throw new Error(errorMsg);
    }
    throw new Error('Failed to create goal');
  }
};

// @desc Update goal
export const updateGoal = async (id: string, data: UpdateGoalData): Promise<Goal> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.put<GoalApiResponse<Goal>>(`${API_URL}goals/${id}`, data, {
      headers,
    });

    console.log('Update Goal Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to update goal');
  } catch (error) {
    console.error('Update Goal Error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Goal not found');
      }
      if (error.response?.data) {
        const errorMsg =
          error.response.data.error?.message ||
          error.response.data.message ||
          'Failed to update goal';
        throw new Error(errorMsg);
      }
    }
    throw new Error('Failed to update goal');
  }
};

// @desc Delete goal
export const deleteGoal = async (id: string): Promise<void> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.delete<GoalApiResponse>(`${API_URL}goals/${id}`, { headers });

    console.log('Delete Goal Response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete goal');
    }
  } catch (error) {
    console.error('Delete Goal Error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Goal not found');
      }
      if (error.response?.data) {
        const errorMsg =
          error.response.data.error?.message ||
          error.response.data.message ||
          'Failed to delete goal';
        throw new Error(errorMsg);
      }
    }
    throw new Error('Failed to delete goal');
  }
};

// @desc Update goal progress (add funds)
export const updateGoalProgress = async (
  id: string,
  data: UpdateGoalProgressData
): Promise<GoalWithProgress> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.put<GoalApiResponse<GoalWithProgress>>(
      `${API_URL}goals/${id}/progress`,
      data,
      { headers }
    );

    console.log('Update Goal Progress Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to update progress');
  } catch (error) {
    console.error('Update Goal Progress Error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Goal not found');
      }
      if (error.response?.data) {
        const errorMsg =
          error.response.data.error?.message ||
          error.response.data.message ||
          'Failed to update progress';
        throw new Error(errorMsg);
      }
    }
    throw new Error('Failed to update progress');
  }
};

// @desc Get goal statistics
export const getGoalStats = async (): Promise<GoalStats> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<GoalApiResponse<GoalStats>>(`${API_URL}goals/stats`, {
      headers,
    });

    console.log('Get Goal Stats Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch goal stats');
  } catch (error) {
    console.error('Get Goal Stats Error:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error?.message ||
        error.response.data.message ||
        'Failed to fetch goal stats';
      throw new Error(errorMsg);
    }
    throw new Error('Failed to fetch goal stats');
  }
};

import axios from 'axios';
import { API_URL } from '../api';
import { store } from 'src/store';
import {
  FamilyMember,
  FamilyMemberStats,
  CreateFamilyMemberRequest,
  UpdateFamilyMemberData,
  FamilyMemberApiResponse,
} from 'src/types/familyMember';

const getAuthHeader = () => {
  const token = store.getState().auth.token;
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// @desc Get all family members for user
export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<FamilyMemberApiResponse<FamilyMember[]>>(
      `${API_URL}family-members`,
      { headers }
    );

    console.log('Get Family Members Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch family members');
  } catch (error) {
    console.error('Get Family Members Error:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error?.message ||
        error.response.data.message ||
        'Failed to fetch family members';
      throw new Error(errorMsg);
    }
    throw new Error('Failed to fetch family members');
  }
};

// @desc Get single family member by ID
export const getFamilyMember = async (id: string): Promise<FamilyMember> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<FamilyMemberApiResponse<FamilyMember>>(
      `${API_URL}family-members/${id}`,
      { headers }
    );

    console.log('Get Family Member Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch family member');
  } catch (error) {
    console.error('Get Family Member Error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Family member not found');
      }
      if (error.response?.data) {
        const errorMsg =
          error.response.data.error?.message ||
          error.response.data.message ||
          'Failed to fetch family member';
        throw new Error(errorMsg);
      }
    }
    throw new Error('Failed to fetch family member');
  }
};

// @desc Create new family member
export const createFamilyMember = async (
  data: CreateFamilyMemberRequest
): Promise<FamilyMember> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.post<FamilyMemberApiResponse<FamilyMember>>(
      `${API_URL}family-members`,
      data,
      { headers }
    );

    console.log('Create Family Member Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to create family member');
  } catch (error) {
    console.error('Create Family Member Error:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error?.message ||
        error.response.data.message ||
        'Failed to create family member';
      throw new Error(errorMsg);
    }
    throw new Error('Failed to create family member');
  }
};

// @desc Update family member
export const updateFamilyMember = async (
  id: string,
  data: UpdateFamilyMemberData
): Promise<FamilyMember> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.put<FamilyMemberApiResponse<FamilyMember>>(
      `${API_URL}family-members/${id}`,
      data,
      { headers }
    );

    console.log('Update Family Member Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to update family member');
  } catch (error) {
    console.error('Update Family Member Error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Family member not found');
      }
      if (error.response?.data) {
        const errorMsg =
          error.response.data.error?.message ||
          error.response.data.message ||
          'Failed to update family member';
        throw new Error(errorMsg);
      }
    }
    throw new Error('Failed to update family member');
  }
};

// @desc Delete family member
export const deleteFamilyMember = async (id: string): Promise<void> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.delete<FamilyMemberApiResponse>(`${API_URL}family-members/${id}`, {
      headers,
    });

    console.log('Delete Family Member Response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete family member');
    }
  } catch (error) {
    console.error('Delete Family Member Error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Family member not found');
      }
      if (error.response?.data) {
        const errorMsg =
          error.response.data.error?.message ||
          error.response.data.message ||
          'Failed to delete family member';
        throw new Error(errorMsg);
      }
    }
    throw new Error('Failed to delete family member');
  }
};

// @desc Get family member statistics
export const getFamilyMemberStats = async (): Promise<FamilyMemberStats> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<FamilyMemberApiResponse<FamilyMemberStats>>(
      `${API_URL}family-members/stats`,
      { headers }
    );

    console.log('Get Family Member Stats Response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch family member stats');
  } catch (error) {
    console.error('Get Family Member Stats Error:', error);
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error?.message ||
        error.response.data.message ||
        'Failed to fetch family member stats';
      throw new Error(errorMsg);
    }
    throw new Error('Failed to fetch family member stats');
  }
};

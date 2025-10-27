import api from '../api';

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (data: UpdateUserData) => {
  try {
    const response = await api.put('/auth/profile', data);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

/**
 * Update user password
 */
export const updatePassword = async (data: UpdatePasswordData) => {
  try {
    const response = await api.put('/auth/password', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update password');
  }
};

/**
 * Delete user account
 */
export const deleteAccount = async () => {
  try {
    const response = await api.delete('/auth/account');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete account');
  }
};

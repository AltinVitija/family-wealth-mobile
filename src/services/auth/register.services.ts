// services/auth/register.services.ts
import axios from 'axios';
import { RegisterCredentials, RegisterResponse } from 'src/types/user';
import { storeData } from '../storage/asyncStorage';
import { API_URL } from '../api';

export const registerUser = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
  try {
    const { name, email, password, phoneNumber } = credentials;

    // Split name into firstName and lastName
    const [firstName, ...lastNameParts] = name.trim().split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    // Backend expects: email, password, firstName, lastName, phone
    const response = await axios.post<RegisterResponse>(`${API_URL}auth/register`, {
      email,
      password,
      firstName,
      lastName,
      phone: phoneNumber || '',
    });

    console.log('Register Backend Response:', response.data);

    // ✅ Store tokens - no mapping needed
    await storeData({ key: 'token', value: response.data.accessToken });
    await storeData({ key: 'refreshToken', value: response.data.refreshToken });

    console.log('Tokens stored successfully');
    return response.data;
  } catch (error) {
    console.error('Register Error:', error);

    if (axios.isAxiosError(error) && error.response?.data) {
      const errorMsg =
        error.response.data.error || error.response.data.message || 'Registration failed';
      throw new Error(errorMsg);
    }
    throw new Error('Registration failed');
  }
};

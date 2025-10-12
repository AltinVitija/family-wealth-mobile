// types/auth.types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  dateOfBirth?: string;
  agreeToTerms: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  hasCompletedProfile: boolean;
  user: User;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  hasCompletedProfile: boolean;
  user: User;
}

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  splashVisible: boolean;
  hasCompletedProfile: boolean;
  isInitializing: boolean;
  user: User | null;
}

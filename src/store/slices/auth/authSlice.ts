import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InitialStateType {
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  splashVisible: boolean;
  hasCompletedProfile: boolean;
  isInitializing: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface LoginSuccessParams {
  accessToken: string;
  refreshToken: string;
  hasCompletedProfile: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface RefreshTokenParams {
  accessToken: string;
  refreshToken: string;
}

const initialState: InitialStateType = {
  isLoading: false,
  isInitializing: true,
  error: null,
  token: null,
  refreshToken: null,
  splashVisible: true,
  hasCompletedProfile: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<LoginSuccessParams>) => {
      state.isLoading = false;
      state.isInitializing = false;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.hasCompletedProfile = action.payload.hasCompletedProfile;
      state.user = action.payload.user || null;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isInitializing = false;
      state.token = null;
      state.refreshToken = null;
      state.user = null;
    },

    // Register actions
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<LoginSuccessParams>) => {
      state.isLoading = false;
      state.isInitializing = false;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.hasCompletedProfile = action.payload.hasCompletedProfile;
      state.user = action.payload.user || null;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      return { ...initialState, isInitializing: false, splashVisible: false };
    },

    // Token refresh
    refreshTokenSuccess: (state, action: PayloadAction<RefreshTokenParams>) => {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    refreshTokenFailure: (state) => {
      return { ...initialState, isInitializing: false, splashVisible: false };
    },

    // Profile completion
    setHasCompletedProfile: (state, action: PayloadAction<boolean>) => {
      state.hasCompletedProfile = action.payload;
      state.isLoading = false;
    },
    profileCompletionStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    profileCompletionSuccess: (state) => {
      state.isLoading = false;
      state.hasCompletedProfile = true;
      state.error = null;
    },
    profileCompletionFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    hideSplash: (state) => {
      state.splashVisible = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    initializationComplete: (state) => {
      state.isInitializing = false;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  refreshTokenSuccess,
  refreshTokenFailure,
  setHasCompletedProfile,
  profileCompletionStart,
  profileCompletionSuccess,
  profileCompletionFailure,
  hideSplash,
  clearError,
  initializationComplete,
} = authSlice.actions;

export default authSlice.reducer;

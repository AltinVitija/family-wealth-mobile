import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardData, DashboardState } from 'src/types/dashboard';

const initialState: DashboardState = {
  data: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Fetch dashboard data
    fetchDashboardStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchDashboardSuccess: (state, action: PayloadAction<DashboardData>) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    fetchDashboardFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetDashboard: () => initialState,
  },
});

export const {
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  clearError,
  resetDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

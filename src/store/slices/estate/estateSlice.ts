import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EstatePlan, EstatePlanStats, EstatePlanState } from 'src/types/estatePlan';

const initialState: EstatePlanState = {
  plans: [],
  currentPlan: null,
  stats: null,
  isLoading: false,
  error: null,
};

const estatePlanSlice = createSlice({
  name: 'estatePlans',
  initialState,
  reducers: {
    // Fetch all plans
    fetchPlansStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPlansSuccess: (state, action: PayloadAction<EstatePlan[]>) => {
      state.isLoading = false;
      state.plans = action.payload;
      state.error = null;
    },
    fetchPlansFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch single plan
    fetchPlanStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPlanSuccess: (state, action: PayloadAction<EstatePlan>) => {
      state.isLoading = false;
      state.currentPlan = action.payload;
      state.error = null;
    },
    fetchPlanFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Add plan (direct add without loading states)
    addPlan: (state, action: PayloadAction<EstatePlan>) => {
      state.plans.unshift(action.payload); // Add to beginning
      state.error = null;
    },

    // Create plan
    createPlanStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createPlanSuccess: (state, action: PayloadAction<EstatePlan>) => {
      state.isLoading = false;
      state.plans.unshift(action.payload); // Add to beginning
      state.currentPlan = action.payload;
      state.error = null;
    },
    createPlanFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update plan
    updatePlanStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updatePlanSuccess: (state, action: PayloadAction<EstatePlan>) => {
      state.isLoading = false;
      const index = state.plans.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
      if (state.currentPlan?._id === action.payload._id) {
        state.currentPlan = action.payload;
      }
      state.error = null;
    },
    updatePlanFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete plan
    deletePlanStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deletePlanSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.plans = state.plans.filter((p) => p._id !== action.payload);
      if (state.currentPlan?._id === action.payload) {
        state.currentPlan = null;
      }
      state.error = null;
    },
    deletePlanFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch stats
    fetchStatsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchStatsSuccess: (state, action: PayloadAction<EstatePlanStats>) => {
      state.isLoading = false;
      state.stats = action.payload;
      state.error = null;
    },
    fetchStatsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Set current plan
    setCurrentPlan: (state, action: PayloadAction<EstatePlan | null>) => {
      state.currentPlan = action.payload;
    },

    // Clear current plan
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetEstatePlans: () => initialState,
  },
});

export const {
  fetchPlansStart,
  fetchPlansSuccess,
  fetchPlansFailure,
  fetchPlanStart,
  fetchPlanSuccess,
  fetchPlanFailure,
  addPlan,
  createPlanStart,
  createPlanSuccess,
  createPlanFailure,
  updatePlanStart,
  updatePlanSuccess,
  updatePlanFailure,
  deletePlanStart,
  deletePlanSuccess,
  deletePlanFailure,
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  setCurrentPlan,
  clearCurrentPlan,
  clearError,
  resetEstatePlans,
} = estatePlanSlice.actions;

export default estatePlanSlice.reducer;

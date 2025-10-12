import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Goal, GoalWithProgress, GoalStats, GoalState } from 'src/types/goals';

const initialState: GoalState = {
  goals: [],
  currentGoal: null,
  stats: null,
  isLoading: false,
  error: null,
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    // Fetch all goals
    fetchGoalsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchGoalsSuccess: (state, action: PayloadAction<Goal[]>) => {
      state.isLoading = false;
      state.goals = action.payload;
      state.error = null;
    },
    fetchGoalsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch single goal
    fetchGoalStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchGoalSuccess: (state, action: PayloadAction<GoalWithProgress>) => {
      state.isLoading = false;
      state.currentGoal = action.payload;
      state.error = null;
    },
    fetchGoalFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Add goal (direct add without loading states)
    addGoal: (state, action: PayloadAction<Goal>) => {
      state.goals.unshift(action.payload);
      state.error = null;
    },

    // Create goal
    createGoalStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createGoalSuccess: (state, action: PayloadAction<Goal>) => {
      state.isLoading = false;
      state.goals.unshift(action.payload);
      state.error = null;
    },
    createGoalFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update goal
    updateGoalStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateGoalSuccess: (state, action: PayloadAction<Goal>) => {
      state.isLoading = false;
      const index = state.goals.findIndex((g) => g._id === action.payload._id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
      if (state.currentGoal?._id === action.payload._id) {
        state.currentGoal = { ...state.currentGoal, ...action.payload };
      }
      state.error = null;
    },
    updateGoalFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update goal progress
    updateProgressStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateProgressSuccess: (state, action: PayloadAction<GoalWithProgress>) => {
      state.isLoading = false;
      const index = state.goals.findIndex((g) => g._id === action.payload._id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
      state.currentGoal = action.payload;
      state.error = null;
    },
    updateProgressFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete goal
    deleteGoalStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteGoalSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.goals = state.goals.filter((g) => g._id !== action.payload);
      if (state.currentGoal?._id === action.payload) {
        state.currentGoal = null;
      }
      state.error = null;
    },
    deleteGoalFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch stats
    fetchStatsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchStatsSuccess: (state, action: PayloadAction<GoalStats>) => {
      state.isLoading = false;
      state.stats = action.payload;
      state.error = null;
    },
    fetchStatsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Set current goal
    setCurrentGoal: (state, action: PayloadAction<GoalWithProgress | null>) => {
      state.currentGoal = action.payload;
    },

    // Clear current goal
    clearCurrentGoal: (state) => {
      state.currentGoal = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetGoals: () => initialState,
  },
});

export const {
  fetchGoalsStart,
  fetchGoalsSuccess,
  fetchGoalsFailure,
  fetchGoalStart,
  fetchGoalSuccess,
  fetchGoalFailure,
  addGoal,
  createGoalStart,
  createGoalSuccess,
  createGoalFailure,
  updateGoalStart,
  updateGoalSuccess,
  updateGoalFailure,
  updateProgressStart,
  updateProgressSuccess,
  updateProgressFailure,
  deleteGoalStart,
  deleteGoalSuccess,
  deleteGoalFailure,
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  setCurrentGoal,
  clearCurrentGoal,
  clearError,
  resetGoals,
} = goalsSlice.actions;

export default goalsSlice.reducer;

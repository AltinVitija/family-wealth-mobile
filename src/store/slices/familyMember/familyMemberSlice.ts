import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FamilyMember, FamilyMemberStats, FamilyMemberState } from 'src/types/familyMember';

const initialState: FamilyMemberState = {
  members: [],
  currentMember: null,
  stats: null,
  isLoading: false,
  error: null,
};

const familyMemberSlice = createSlice({
  name: 'familyMembers',
  initialState,
  reducers: {
    // Fetch all members
    fetchMembersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMembersSuccess: (state, action: PayloadAction<FamilyMember[]>) => {
      state.isLoading = false;
      state.members = action.payload;
      state.error = null;
    },
    fetchMembersFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch single member
    fetchMemberStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMemberSuccess: (state, action: PayloadAction<FamilyMember>) => {
      state.isLoading = false;
      state.currentMember = action.payload;
      state.error = null;
    },
    fetchMemberFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Add member (direct add without loading states)
    addMember: (state, action: PayloadAction<FamilyMember>) => {
      state.members.unshift(action.payload);
      state.error = null;
    },

    // Create member
    createMemberStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createMemberSuccess: (state, action: PayloadAction<FamilyMember>) => {
      state.isLoading = false;
      state.members.unshift(action.payload);
      state.error = null;
    },
    createMemberFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update member
    updateMemberStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateMemberSuccess: (state, action: PayloadAction<FamilyMember>) => {
      state.isLoading = false;
      const index = state.members.findIndex((m) => m._id === action.payload._id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
      if (state.currentMember?._id === action.payload._id) {
        state.currentMember = action.payload;
      }
      state.error = null;
    },
    updateMemberFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete member
    deleteMemberStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteMemberSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.members = state.members.filter((m) => m._id !== action.payload);
      if (state.currentMember?._id === action.payload) {
        state.currentMember = null;
      }
      state.error = null;
    },
    deleteMemberFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch stats
    fetchStatsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchStatsSuccess: (state, action: PayloadAction<FamilyMemberStats>) => {
      state.isLoading = false;
      state.stats = action.payload;
      state.error = null;
    },
    fetchStatsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Set current member
    setCurrentMember: (state, action: PayloadAction<FamilyMember | null>) => {
      state.currentMember = action.payload;
    },

    // Clear current member
    clearCurrentMember: (state) => {
      state.currentMember = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetFamilyMembers: () => initialState,
  },
});

export const {
  fetchMembersStart,
  fetchMembersSuccess,
  fetchMembersFailure,
  fetchMemberStart,
  fetchMemberSuccess,
  fetchMemberFailure,
  addMember,
  createMemberStart,
  createMemberSuccess,
  createMemberFailure,
  updateMemberStart,
  updateMemberSuccess,
  updateMemberFailure,
  deleteMemberStart,
  deleteMemberSuccess,
  deleteMemberFailure,
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  setCurrentMember,
  clearCurrentMember,
  clearError,
  resetFamilyMembers,
} = familyMemberSlice.actions;

export default familyMemberSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ForgotPasswordState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  email: string;
  code: string;
  newPassword: string;
}

const initialState: ForgotPasswordState = {
  isLoading: false,
  error: null,
  success: false,
  email: "",
  code: "",
  newPassword: "",
};

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState,
  reducers: {
    forgotPasswordStart: (state) => {
      state.isLoading = true;
      state.error = null;
      state.success = false;
    },
    forgotPasswordEmailSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.success = true;
      state.email = action.payload;
    },
    forgotPasswordCodeSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.success = true;
      state.code = action.payload;
    },
    forgotPasswordSetPasswordSuccess: (
      state,
      action: PayloadAction<string>
    ) => {
      state.isLoading = false;
      state.success = true;
      state.newPassword = action.payload;
    },
    forgotPasswordFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    forgotPasswordResendStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    forgotPasswordResendSuccess: (state) => {
      state.isLoading = false;
      state.success = true;
    },
    forgotPasswordResendFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    resetState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
      state.email = "";
      state.code = "";
      state.newPassword = "";
    },
  },
});

export const {
  forgotPasswordStart,
  forgotPasswordEmailSuccess,
  forgotPasswordCodeSuccess,
  forgotPasswordSetPasswordSuccess,
  forgotPasswordFailure,
  forgotPasswordResendStart,
  forgotPasswordResendSuccess,
  forgotPasswordResendFailure,
  resetState,
} = forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;

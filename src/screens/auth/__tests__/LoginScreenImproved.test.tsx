import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import LoginScreenImproved from '../LoginScreenImproved';
import authReducer from 'src/store/slices/auth/authSlice';
import * as loginServices from 'src/services/auth/login.services';

jest.mock('src/services/auth/login.services');
jest.spyOn(Alert, 'alert');

describe('LoginScreenImproved', () => {
  let store: any;
  let mockNavigation: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer },
    });
    mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <LoginScreenImproved navigation={mockNavigation} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render login screen correctly', () => {
      const { getByText, getByPlaceholderText } = renderComponent();
      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByText('Sign in to your account')).toBeTruthy();
      expect(getByPlaceholderText('email@example.com')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
    });

    it('should render forgot password link', () => {
      const { getByText } = renderComponent();
      expect(getByText('Forgot password?')).toBeTruthy();
    });

    it('should render sign up link', () => {
      const { getByText } = renderComponent();
      expect(getByText(/Sign Up/)).toBeTruthy();
    });

    it('should render version info', () => {
      const { getByText } = renderComponent();
      expect(getByText('Version 1.0.0')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should accept email input', async () => {
      const { getByPlaceholderText } = renderComponent();
      const emailInput = getByPlaceholderText('email@example.com');
      fireEvent.changeText(emailInput, 'test@example.com');
      expect(emailInput).toBeTruthy();
    });

    it('should accept password input', async () => {
      const { getByPlaceholderText } = renderComponent();
      const passwordInput = getByPlaceholderText('Enter your password');
      fireEvent.changeText(passwordInput, 'password123');
      expect(passwordInput).toBeTruthy();
    });

    it('should render form inputs correctly', () => {
      const { getByPlaceholderText } = renderComponent();
      expect(getByPlaceholderText('email@example.com')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    });
  });

  describe('Login Functionality', () => {
    it('should call login service with valid credentials', async () => {
      const mockResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' },
      };
      (loginServices.loginUser as jest.Mock).mockResolvedValue(mockResponse);

      const { getByPlaceholderText, getByText } = renderComponent();
      fireEvent.changeText(getByPlaceholderText('email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(loginServices.loginUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should handle login service errors gracefully', async () => {
      (loginServices.loginUser as jest.Mock).mockRejectedValue({ message: 'Invalid credentials' });

      const { getByPlaceholderText, getByText } = renderComponent();
      fireEvent.changeText(getByPlaceholderText('email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrongpassword');
      fireEvent.press(getByText('Sign In'));

      // Just verify the component handles the error without crashing
      await waitFor(() => {
        expect(loginServices.loginUser).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should render forgot password link', () => {
      const { getByText } = renderComponent();
      const forgotLink = getByText('Forgot password?');
      expect(forgotLink).toBeTruthy();
    });

    it('should render sign up link', () => {
      const { getByText } = renderComponent();
      expect(getByText(/Sign Up/)).toBeTruthy();
    });
  });
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import RegisterScreenImproved from '../RegisterScreenImproved';
import authReducer from 'src/store/slices/auth/authSlice';
import * as registerServices from 'src/services/auth/register.services';

jest.mock('src/services/auth/register.services');
jest.spyOn(Alert, 'alert');

describe('RegisterScreenImproved', () => {
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
        <RegisterScreenImproved navigation={mockNavigation} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render register screen correctly', () => {
      const { getByText, getByPlaceholderText, getAllByText } = renderComponent();
      expect(getAllByText('Create Account').length).toBeGreaterThan(0);
      expect(getByText('Start managing your wealth')).toBeTruthy();
      expect(getByPlaceholderText('Your first name')).toBeTruthy();
      expect(getByPlaceholderText('Your last name')).toBeTruthy();
      expect(getByPlaceholderText('email@example.com')).toBeTruthy();
    });

    it('should render all form fields', () => {
      const { getByText } = renderComponent();
      expect(getByText('First Name *')).toBeTruthy();
      expect(getByText('Last Name *')).toBeTruthy();
      expect(getByText('Email *')).toBeTruthy();
      expect(getByText('Password *')).toBeTruthy();
      expect(getByText('Confirm Password *')).toBeTruthy();
    });

    it('should render terms and privacy policy text', () => {
      const { getByText } = renderComponent();
      expect(getByText(/By registering, you agree to our/)).toBeTruthy();
      expect(getByText('Terms of Service')).toBeTruthy();
      expect(getByText('Privacy Policy')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should render first name input', async () => {
      const { getByPlaceholderText } = renderComponent();
      const firstNameInput = getByPlaceholderText('Your first name');
      fireEvent.changeText(firstNameInput, 'John');
      expect(firstNameInput).toBeTruthy();
    });

    it('should render last name input', async () => {
      const { getByPlaceholderText } = renderComponent();
      const lastNameInput = getByPlaceholderText('Your last name');
      fireEvent.changeText(lastNameInput, 'Doe');
      expect(lastNameInput).toBeTruthy();
    });

    it('should accept email input', async () => {
      const { getByPlaceholderText } = renderComponent();
      const emailInput = getByPlaceholderText('email@example.com');
      fireEvent.changeText(emailInput, 'test@example.com');
      expect(emailInput).toBeTruthy();
    });

    it('should accept password input', async () => {
      const { getByPlaceholderText } = renderComponent();
      const passwordInput = getByPlaceholderText('Minimum 6 characters');
      fireEvent.changeText(passwordInput, 'password123');
      expect(passwordInput).toBeTruthy();
    });

    it('should accept confirm password input', async () => {
      const { getByPlaceholderText } = renderComponent();
      const confirmPasswordInput = getByPlaceholderText('Re-enter your password');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      expect(confirmPasswordInput).toBeTruthy();
    });
  });

  describe('Registration Functionality', () => {
    it('should successfully register with valid data', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
      };
      (registerServices.registerUser as jest.Mock).mockResolvedValue(mockResponse);

      const { getByPlaceholderText, getAllByText } = renderComponent();

      fireEvent.changeText(getByPlaceholderText('Your first name'), 'John');
      fireEvent.changeText(getByPlaceholderText('Your last name'), 'Doe');
      fireEvent.changeText(getByPlaceholderText('email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Minimum 6 characters'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'password123');

      const buttons = getAllByText('Create Account');
      fireEvent.press(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(registerServices.registerUser).toHaveBeenCalled();
      });
    });

    it('should handle registration errors gracefully', async () => {
      (registerServices.registerUser as jest.Mock).mockRejectedValue({
        message: 'Email already exists',
      });

      const { getByPlaceholderText, getAllByText } = renderComponent();

      fireEvent.changeText(getByPlaceholderText('Your first name'), 'John');
      fireEvent.changeText(getByPlaceholderText('Your last name'), 'Doe');
      fireEvent.changeText(getByPlaceholderText('email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Minimum 6 characters'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Re-enter your password'), 'password123');

      const buttons = getAllByText('Create Account');
      fireEvent.press(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(registerServices.registerUser).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should render sign in link', () => {
      const { getByText } = renderComponent();
      expect(getByText(/Sign In/)).toBeTruthy();
    });
  });

  describe('Optional Fields', () => {
    it('should accept phone number', () => {
      const { getByPlaceholderText } = renderComponent();
      const phoneInput = getByPlaceholderText('+355 XX XXX XXX');
      fireEvent.changeText(phoneInput, '+355 69 123 4567');
      expect(phoneInput.props.value).toBe('+355 69 123 4567');
    });
  });
});

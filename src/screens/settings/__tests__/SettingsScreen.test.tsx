import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SettingsScreen from '../SettingsScreen';
import authReducer from 'src/store/slices/auth/authSlice';

describe('SettingsScreen', () => {
  let store: any;
  let mockNavigation: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: '1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
          tokens: { accessToken: 'token', refreshToken: 'refresh' },
          isLoading: false,
          error: null,
          splashVisible: false,
          hasCompletedProfile: true,
          isInitializing: false,
        },
      },
    });
    mockNavigation = {
      navigate: jest.fn(),
    };
  });

  it('should render settings screen', () => {
    const { getByText } = render(
      <Provider store={store}>
        <SettingsScreen navigation={mockNavigation} />
      </Provider>
    );
    expect(getByText(/Settings/i)).toBeTruthy();
  });
});

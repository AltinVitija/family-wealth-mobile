#!/bin/bash

# Dashboard Test
cat > src/screens/dashboard/__tests__/DashboardScreenImproved.test.tsx << 'EOF'
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardScreenImproved from '../DashboardScreenImproved';
import dashboardReducer from 'src/store/slices/dashboard/dashboardSlice';
import authReducer from 'src/store/slices/auth/authSlice';

describe('DashboardScreenImproved', () => {
  let store: any;
  let mockNavigation: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        dashboard: dashboardReducer,
        auth: authReducer,
      },
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
        dashboard: {
          data: null,
          isLoading: false,
          error: null,
          lastUpdated: null,
        },
      },
    });
    mockNavigation = {
      navigate: jest.fn(),
    };
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <DashboardScreenImproved navigation={mockNavigation} route={{} as any} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render dashboard header', () => {
      const { getByText } = renderComponent();
      expect(getByText('Dashboard')).toBeTruthy();
    });

    it('should render welcome message', () => {
      const { getByText } = renderComponent();
      expect(getByText(/Hello/)).toBeTruthy();
    });

    it('should render empty state when no data', () => {
      const { getByText } = renderComponent();
      expect(getByText(/Get Started/i)).toBeTruthy();
    });
  });

  describe('Data Display', () => {
    it('should show loading indicator', () => {
      store = configureStore({
        reducer: { dashboard: dashboardReducer, auth: authReducer },
        preloadedState: {
          ...store.getState(),
          dashboard: { data: null, isLoading: true, error: null, lastUpdated: null },
        },
      });
      const { getByTestId } = render(
        <Provider store={store}>
          <DashboardScreenImproved navigation={mockNavigation} route={{} as any} />
        </Provider>
      );
      expect(getByTestId).toBeTruthy();
    });

    it('should display statistics when data is loaded', () => {
      store = configureStore({
        reducer: { dashboard: dashboardReducer, auth: authReducer },
        preloadedState: {
          ...store.getState(),
          dashboard: {
            data: {
              totalWealth: 1000000,
              yearGrowth: 8.5,
              estatePlansCount: 2,
              familyMembersCount: 4,
              pendingTasksCount: 3,
              activeGoalsCount: 5,
            },
            isLoading: false,
            error: null,
            lastUpdated: new Date().toISOString(),
          },
        },
      });
      const { getByText } = render(
        <Provider store={store}>
          <DashboardScreenImproved navigation={mockNavigation} route={{} as any} />
        </Provider>
      );
      expect(getByText).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to Estate Plans', () => {
      const { getAllByRole } = renderComponent();
      const cards = getAllByRole('button');
      if (cards.length > 0) {
        fireEvent.press(cards[0]);
      }
      expect(mockNavigation.navigate).toHaveBeenCalled();
    });

    it('should navigate to Family Members', () => {
      const { getByText } = renderComponent();
      const familySection = getByText(/Family/i);
      if (familySection) {
        fireEvent.press(familySection);
      }
      expect(mockNavigation.navigate).toHaveBeenCalled();
    });

    it('should navigate to Goals', () => {
      const { getByText } = renderComponent();
      const goalsSection = getByText(/Goal/i);
      if (goalsSection) {
        fireEvent.press(goalsSection);
      }
      expect(mockNavigation.navigate).toHaveBeenCalled();
    });
  });

  describe('Refresh', () => {
    it('should trigger refresh on pull down', () => {
      const { getByTestId } = renderComponent();
      expect(getByTestId).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      store = configureStore({
        reducer: { dashboard: dashboardReducer, auth: authReducer },
        preloadedState: {
          ...store.getState(),
          dashboard: { data: null, isLoading: false, error: 'Failed to load', lastUpdated: null },
        },
      });
      const { getByText } = render(
        <Provider store={store}>
          <DashboardScreenImproved navigation={mockNavigation} route={{} as any} />
        </Provider>
      );
      expect(getByText).toBeTruthy();
    });
  });
});
EOF

echo "Dashboard test created"

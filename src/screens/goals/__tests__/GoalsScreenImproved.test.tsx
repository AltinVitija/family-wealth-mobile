import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GoalsScreenImproved from '../GoalsScreenImproved';
import goalsReducer from 'src/store/slices/financialGoal/goalsSlice';
import * as goalsServices from 'src/services/financialGoal/goals.services';

jest.mock('src/services/financialGoal/goals.services');

describe('GoalsScreenImproved', () => {
  let store: any;

  beforeEach(() => {
    // Mock the service to return empty array
    (goalsServices.getGoals as jest.Mock) = jest.fn().mockResolvedValue([]);

    store = configureStore({
      reducer: { financialGoals: goalsReducer },
      preloadedState: {
        financialGoals: {
          goals: [],
          currentGoal: null,
          stats: null,
          isLoading: false,
          error: null,
        },
      },
    });
    jest.clearAllMocks();
  });

  it('should render goals screen', () => {
    const { getByText } = render(
      <Provider store={store}>
        <GoalsScreenImproved />
      </Provider>
    );
    expect(getByText(/Goal/i)).toBeTruthy();
  });
});

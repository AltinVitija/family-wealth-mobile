import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FamilyScreenImproved from '../FamilyScreenImproved';
import familyMemberReducer from 'src/store/slices/familyMember/familyMemberSlice';
import * as familyMemberServices from 'src/services/familyMember/familyMember.services';

jest.mock('src/services/familyMember/familyMember.services');

describe('FamilyScreenImproved', () => {
  let store: any;

  beforeEach(() => {
    // Mock the service to return empty array
    (familyMemberServices.getFamilyMembers as jest.Mock) = jest.fn().mockResolvedValue([]);

    store = configureStore({
      reducer: { familyMembers: familyMemberReducer },
      preloadedState: {
        familyMembers: {
          members: [],
          isLoading: false,
          error: null,
          currentMember: null,
          stats: null,
        },
      },
    });
    jest.clearAllMocks();
  });

  it('should render family screen', () => {
    const { getAllByText } = render(
      <Provider store={store}>
        <FamilyScreenImproved />
      </Provider>
    );
    // Use getAllByText since there might be multiple elements with "Family"
    const familyElements = getAllByText(/Family/i);
    expect(familyElements.length).toBeGreaterThan(0);
  });
});

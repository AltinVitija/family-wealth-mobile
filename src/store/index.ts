// store/index.ts - WITHOUT ESTATE PLAN PERSISTENCE
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/auth/authSlice';
import estatePlanReducer from 'src/store/slices/estate/estateSlice';
import financialGoalReducer from './slices/financialGoal/goalsSlice';
import familyMemberReducer from './slices/familyMember/familyMemberSlice';
import dashboardReducer from './slices/dashboard/dashboardSlice';

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['token', 'refreshToken', 'user', 'hasCompletedProfile'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    estatePlans: estatePlanReducer, // No persistence - always fetch fresh
    financialGoals: financialGoalReducer,
    familyMembers: familyMemberReducer,
    dashboardReducer: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

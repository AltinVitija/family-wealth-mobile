import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { RootState } from 'src/store';
import { ROUTES } from 'src/utils/constants';
import { RootStackParamList } from '../types/navigation';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { loginSuccess, initializationComplete, logout } from 'src/store/slices/auth/authSlice';
import { API_URL } from 'src/services/api';

import 'src/services/axiosInterceptor';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { token, refreshToken, isInitializing } = useSelector((state: RootState) => state.auth);

  // Validate and refresh token on app startup
  useEffect(() => {
    const validateAndRestoreSession = async () => {
      try {
        // If we have a token in Redux (from persistence), validate it
        if (token && refreshToken) {
          console.log('Token found in Redux, validating...');

          try {
            // Try to refresh the token to ensure it's valid
            const response = await axios.post(`${API_URL}auth/refresh`, {
              refreshToken,
            });

            // FIXED: Check success before accessing data
            if (response.data.success && response.data.data) {
              const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;

              console.log('Token refresh successful');

              // Update with fresh tokens
              dispatch(
                loginSuccess({
                  accessToken,
                  refreshToken: newRefreshToken || refreshToken,
                  user: user || undefined,
                  hasCompletedProfile: user?.hasCompletedProfile,
                })
              );
            } else {
              console.log('Invalid refresh response - logging out');
              dispatch(logout());
            }
          } catch (error) {
            console.log('Token validation/refresh failed - logging out');
            // Token refresh failed - token is expired or invalid
            dispatch(logout());
          }
        } else {
          console.log('No token found - showing login screen');
        }
      } catch (error) {
        console.error('Error during session validation:', error);
        dispatch(logout());
      } finally {
        dispatch(initializationComplete());
      }
    };

    validateAndRestoreSession();
  }, []); // Only run once on mount

  // Show splash/loading screen while checking auth
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4b038" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name={ROUTES.AUTH_STACK} component={AuthNavigator} />
        ) : (
          <Stack.Screen name={ROUTES.MAIN_TABS} component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AppNavigator;

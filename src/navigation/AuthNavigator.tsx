import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from 'src/utils/constants';
import { AuthStackParamList } from '../types/navigation';
import LoginScreen from 'src/screens/auth/LoginScreenImproved';
import RegisterScreen from 'src/screens/auth/RegisterScreenImproved';
import ForgotPassword from 'src/screens/auth/ForgotPassword';
import ResetPassword from 'src/screens/auth/ResetPassword';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
      </Stack.Navigator>
    </>
  );
};

export default AuthNavigator;

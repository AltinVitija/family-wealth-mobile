import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from 'src/utils/constants';
import { AuthStackParamList } from '../types/navigation';
import LoginScreen from 'src/screens/auth/LoginScreen';
import RegisterScreen from 'src/screens/auth/RegisterScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
      </Stack.Navigator>
    </>
  );
};

export default AuthNavigator;

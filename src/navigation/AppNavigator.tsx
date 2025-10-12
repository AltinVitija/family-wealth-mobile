// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
// import { RootState } from "../store";
import { ROUTES } from 'src/utils/constants';
import { RootStackParamList } from '../types/navigation';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  //   const { user } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* {!user ? ( */}
        {/* <Stack.Screen name={ROUTES.AUTH_STACK} component={AuthNavigator} /> */}
        {/* ) : ( */}
        <Stack.Screen name={ROUTES.MAIN_TABS} component={MainNavigator} />
        {/* )} */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

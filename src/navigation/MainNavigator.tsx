// src/navigation/MainNavigator.tsx
import 'react-native-screens'; // ← ADD THIS LINE
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { ROUTES } from '../utils/constants';
import { MainTabParamList } from '../types/navigation';
import DashboardScreen from '../screens/dashboard/DashboardScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name={ROUTES.DASHBOARD}
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>🏠</Text>
          ),
          tabBarLabel: 'Dashboard',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;

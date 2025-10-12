import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, View, Text, StatusBar, StyleSheet, Pressable } from 'react-native';
import { ROUTES } from 'src/utils/constants';
import { MainTabParamList } from 'src/types/navigation';

// Screens
import DashboardScreen from 'src/screens/dashboard/DashboardScreen';
import EstateScreen from 'src/screens/estate/EstateScreen';
import GoalsScreen from 'src/screens/goals/GoalsScreen';
import FamilyScreen from 'src/screens/family/FamilyScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// ===== Styles (mirrors your reference look) =====
const TAB_WIDTH = 320; // tweak if you want
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBarStyle: {
    backgroundColor: 'white',
    borderRadius: 35,
    height: 80,
    width: TAB_WIDTH,
    position: 'absolute',
    // Center horizontally
    left: '50%',
    transform: [{ translateX: -(TAB_WIDTH / 2) }],
    // Float near the bottom (similar to your code)
    bottom: 16,
    // On some Android layouts you might want to pin based on top
    // top: Platform.OS === "ios" ? undefined : undefined,

    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',

    // Shadow (iOS) + Elevation (Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  divider: {
    width: 1,
    height: '50%',
    backgroundColor: '#E0E0E0',
  },
  tabBarItemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconFocused: {
    fontSize: 24,
    opacity: 1,
  },
  tabBarLabel: {
    color: '#9F9F9F',
    fontSize: 12,
    marginTop: 4,
  },
  tabBarLabelFocused: {
    color: 'black',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    // fontFamily: "Inter", // uncomment if you’ve loaded this font
  },
});

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  // The order of tabs in `state.routes` matches your <Tab.Screen> order
  const go = (name: string) => navigation.navigate(name as never);

  const renderItem = (index: number, label: string, icon: string) => {
    const { name } = state.routes[index];
    const focused = state.index === index;

    return (
      <Pressable
        key={name}
        style={styles.tabBarItemContainer}
        onPress={() => go(name)}
        android_ripple={{ color: '#eee', borderless: true }}>
        <Text style={focused ? styles.iconFocused : styles.icon}>{icon}</Text>
        <Text style={focused ? styles.tabBarLabelFocused : styles.tabBarLabel}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.tabBarStyle}>
      {renderItem(0, 'Dashboard', '🏠')}
      <View style={styles.divider} />
      {renderItem(1, 'Estate', '📋')}
      <View style={styles.divider} />
      {renderItem(2, 'Family', '👨‍👩‍👧‍👦')}
      <View style={styles.divider} />
      {renderItem(3, 'Goals', '🎯')}
    </View>
  );
};

const MainNavigator = () => {
  return (
    <>
      <StatusBar
        backgroundColor="white"
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
      />
      <Tab.Navigator
        initialRouteName={ROUTES.DASHBOARD}
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}>
        <Tab.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} />
        <Tab.Screen name={ROUTES.ESTATE} component={EstateScreen} />
        <Tab.Screen name={ROUTES.FAMILY} component={FamilyScreen} />
        <Tab.Screen name={ROUTES.GOALS} component={GoalsScreen} />
      </Tab.Navigator>
    </>
  );
};

export default MainNavigator;

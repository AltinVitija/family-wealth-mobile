import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { ROUTES } from 'src/utils/constants';
import { MainTabParamList } from 'src/types/navigation';

// Screens
import DashboardScreen from 'src/screens/dashboard/DashboardScreenImproved';
import EstateScreen from 'src/screens/estate/EstateScreenImproved';
import GoalsScreen from 'src/screens/goals/GoalsScreenImproved';
import FamilyScreen from 'src/screens/family/FamilyScreenImproved';
import SettingsScreen from 'src/screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// ---- ICON SOURCES (from src/assets/icons) ----
const ICONS = {
  dashboard: require('src/assets/icons/home.png'),
  estate: require('src/assets/icons/estate-plans.png'),
  family: require('src/assets/icons/family-members.png'),
  goals: require('src/assets/icons/financial-goals.png'),
  settings: require('src/assets/icons/user.png'),
} as const;

// ===== Styles =====
const TAB_WIDTH = 380;
const ICON_SIZE = 22; // single size for all states

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  tabBarStyle: {
    backgroundColor: 'white',
    borderRadius: 35,
    height: 80,
    width: TAB_WIDTH,
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -(TAB_WIDTH / 2) }],
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  divider: { width: 1, height: '50%', backgroundColor: '#E0E0E0' },
  tabBarItemContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // same size for focused/unfocused; only opacity/tint changes
  iconImg: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    resizeMode: 'contain',
    opacity: 0.6,
    tintColor: '#9F9F9F',
    marginBottom: 4,
  },
  iconImgFocused: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    resizeMode: 'contain',
    opacity: 1,
    tintColor: '#1E3A5F',
    marginBottom: 4,
  },

  // smaller fonts
  tabBarLabel: { color: '#9F9F9F', fontSize: 10, marginTop: 2 },
  tabBarLabelFocused: { color: '#1E3A5F', fontSize: 10, fontWeight: '500', marginTop: 2 },
});

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const go = (name: string) => navigation.navigate(name as never);

  const renderItem = (index: number, label: string, iconSource: ReturnType<typeof require>) => {
    const { name } = state.routes[index];
    const focused = state.index === index;

    return (
      <Pressable
        key={name}
        style={styles.tabBarItemContainer}
        onPress={() => go(name)}
        android_ripple={{ color: '#eee', borderless: true }}
        hitSlop={{ top: 6, bottom: 6, left: 12, right: 12 }}>
        <Image source={iconSource} style={focused ? styles.iconImgFocused : styles.iconImg} />
        <Text
          allowFontScaling={false}
          style={focused ? styles.tabBarLabelFocused : styles.tabBarLabel}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.tabBarStyle}>
      {renderItem(0, 'Home', ICONS.dashboard)}
      <View style={styles.divider} />
      {renderItem(1, 'Estate', ICONS.estate)}
      <View style={styles.divider} />
      {renderItem(2, 'Family', ICONS.family)}
      <View style={styles.divider} />
      {renderItem(3, 'Goals', ICONS.goals)}
      <View style={styles.divider} />
      {renderItem(4, 'Profile', ICONS.settings)}
    </View>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.DASHBOARD}
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} />
      <Tab.Screen name={ROUTES.ESTATE} component={EstateScreen} />
      <Tab.Screen name={ROUTES.FAMILY} component={FamilyScreen} />
      <Tab.Screen name={ROUTES.GOALS} component={GoalsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;

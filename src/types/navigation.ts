// types/navigation.ts
import { ROUTES } from "src/utils/constants";
import { NavigatorScreenParams } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";

// Root Stack (Auth + Main)
export type RootStackParamList = {
  [ROUTES.AUTH_STACK]: NavigatorScreenParams<AuthStackParamList>;
  [ROUTES.MAIN_TABS]: NavigatorScreenParams<MainTabParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
};

// Main Tabs
export type MainTabParamList = {
  [ROUTES.DASHBOARD]: undefined;
  [ROUTES.ESTATE]: undefined;
  [ROUTES.FAMILY]: undefined;
  [ROUTES.GOALS]: undefined;
};

// Estate Stack
export type EstateStackParamList = {
  [ROUTES.ESTATE]: undefined;
  [ROUTES.ESTATE_DETAIL]: { estatePlanId: string };
  [ROUTES.ADD_ESTATE_PLAN]: undefined;
};

// Goals Stack
export type GoalsStackParamList = {
  [ROUTES.GOALS]: undefined;
  [ROUTES.GOAL_DETAIL]: { goalId: string };
  [ROUTES.ADD_GOAL]: undefined;
};

// Family Stack
export type FamilyStackParamList = {
  [ROUTES.FAMILY]: undefined;
  [ROUTES.FAMILY_MEMBER_DETAIL]: { memberId: string };
  [ROUTES.ADD_FAMILY_MEMBER]: undefined;
};

// Screen Props Types
export type DashboardScreenProps = BottomTabScreenProps<
  MainTabParamList,
  typeof ROUTES.DASHBOARD
>;
export type EstateDetailScreenProps = StackScreenProps<
  EstateStackParamList,
  typeof ROUTES.ESTATE_DETAIL
>;
export type GoalDetailScreenProps = StackScreenProps<
  GoalsStackParamList,
  typeof ROUTES.GOAL_DETAIL
>;

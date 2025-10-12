// constants/routes.ts
export const ROUTES = {
  // Auth Stack
  AUTH_STACK: "AuthStack",
  LOGIN: "Login",
  REGISTER: "Register",

  // Main App
  MAIN_TABS: "MainTabs",

  // Tab Screens
  DASHBOARD: "Dashboard",
  ESTATE: "Estate",
  FAMILY: "Family",
  GOALS: "Goals",

  // Detail Screens
  ESTATE_DETAIL: "EstateDetail",
  GOAL_DETAIL: "GoalDetail",
  FAMILY_MEMBER_DETAIL: "FamilyMemberDetail",

  // Modal Screens
  ADD_GOAL: "AddGoal",
  ADD_ESTATE_PLAN: "AddEstatePlan",
  ADD_FAMILY_MEMBER: "AddFamilyMember",
} as const;

export type RouteNames = (typeof ROUTES)[keyof typeof ROUTES];

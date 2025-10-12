// types/dashboard.types.ts

// ============================================
// DASHBOARD OVERVIEW TYPES
// ============================================

export interface DashboardOverview {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalFamilyMembers: number;
  totalEstatePlans: number;
  activeEstatePlans: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  averageGoalProgress: number;
}

// ============================================
// RECENT ACTIVITY TYPES
// ============================================

export type ActivityType =
  | 'goal_created'
  | 'goal_updated'
  | 'goal_completed'
  | 'member_added'
  | 'estate_created'
  | 'estate_updated';

export interface RecentActivity {
  _id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
}

// ============================================
// UPCOMING DEADLINE TYPES
// ============================================

export interface UpcomingDeadline {
  _id: string;
  type: 'goal' | 'estate_review';
  title: string;
  dueDate: string;
  daysRemaining: number;
  priority: 'high' | 'medium' | 'low';
}

// ============================================
// FINANCIAL SUMMARY TYPES
// ============================================

export interface FinancialSummary {
  totalAssets: number;
  totalTargetSavings: number;
  totalCurrentSavings: number;
  savingsProgress: number;
  goalsByType: {
    education: number;
    retirement: number;
    investment: number;
    savings: number;
    other: number;
  };
  recentTransactions?: Transaction[];
}

export interface Transaction {
  _id: string;
  goalId: string;
  goalTitle: string;
  amount: number;
  date: string;
  type: 'contribution' | 'withdrawal';
}

// ============================================
// COMPLETE DASHBOARD DATA
// ============================================

export interface DashboardData {
  overview: DashboardOverview;
  recentActivities: RecentActivity[];
  upcomingDeadlines: UpcomingDeadline[];
  financialSummary: FinancialSummary;
}

// ============================================
// QUICK ACTION TYPES
// ============================================

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

// ============================================
// STATE TYPES
// ============================================

export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface DashboardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

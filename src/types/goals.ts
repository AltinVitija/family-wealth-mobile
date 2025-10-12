// types/goal.types.ts

// ============================================
// GOAL TYPES
// ============================================
export type GoalType = 'savings' | 'investment' | 'retirement' | 'education' | 'other';
export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  type: GoalType;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  assignedMembers?: string[];
  description?: string;
  status?: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// GOAL WITH CALCULATED FIELDS
// ============================================
export interface GoalWithProgress extends Goal {
  progress: number;
  remaining: number;
  daysRemaining: number;
}

// ============================================
// STATS TYPES
// ============================================
export interface GoalStats {
  totalGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalRemaining: number;
  averageProgress: number;
  byType: {
    education: number;
    retirement: number;
    investment: number;
    savings: number;
    other: number;
  };
}

// ============================================
// REQUEST/DATA TYPES
// ============================================
export interface CreateGoalRequest {
  title: string;
  type: GoalType;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  assignedMembers?: string[];
  description?: string;
  status?: GoalStatus;
}

export interface UpdateGoalData {
  title?: string;
  type?: GoalType;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  assignedMembers?: string[];
  description?: string;
  status?: GoalStatus;
}

export interface UpdateGoalProgressData {
  amount: number;
}

// ============================================
// FORM VALIDATION TYPES
// ============================================
export interface GoalFormErrors {
  [key: string]: string | undefined;
  title?: string;
  type?: string;
  targetAmount?: string;
  currentAmount?: string;
  targetDate?: string;
}

// ============================================
// STATE TYPES
// ============================================
export interface GoalState {
  goals: Goal[];
  currentGoal: GoalWithProgress | null;
  stats: GoalStats | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface GoalApiResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

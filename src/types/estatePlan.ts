// types/estatePlan.types.ts

// ============================================
// ASSET TYPES
// ============================================
export interface Asset {
  name: string;
  type: 'property' | 'investment' | 'cash' | 'business' | 'other';
  value: number;
  description?: string;
}

// ============================================
// BENEFICIARY TYPES
// ============================================
export interface Beneficiary {
  familyMemberId: string;
  percentage: number;
  conditions?: string;
}

// ============================================
// ESTATE PLAN TYPES
// ============================================
export type EstatePlanStatus = 'draft' | 'active' | 'archived';

export interface EstatePlan {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  status: EstatePlanStatus;
  assets: Asset[];
  beneficiaries: Beneficiary[];
  executor?: string;
  lastReviewed?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// STATS TYPES
// ============================================
export interface EstatePlanStats {
  totalPlans: number;
  activePlans: number;
  draftPlans: number;
  archivedPlans: number;
  totalValue: number;
  totalAssets: number;
  totalBeneficiaries: number;
}

// ============================================
// REQUEST/DATA TYPES
// ============================================
export interface CreateEstatePlanRequest {
  title: string;
  description?: string;
  status?: EstatePlanStatus;
  assets?: Asset[];
  beneficiaries?: Beneficiary[];
  executor?: string;
}

// Alias for backward compatibility
export interface CreateEstatePlanData extends CreateEstatePlanRequest {}

export interface UpdateEstatePlanData {
  title?: string;
  description?: string;
  status?: EstatePlanStatus;
  assets?: Asset[];
  beneficiaries?: Beneficiary[];
  executor?: string;
}

// ============================================
// FORM VALIDATION TYPES
// ============================================
export interface FormErrors {
  [key: string]: string | undefined;
}

// ============================================
// STATE TYPES
// ============================================
export interface EstatePlanState {
  plans: EstatePlan[];
  currentPlan: EstatePlan | null;
  stats: EstatePlanStats | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface EstatePlanApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

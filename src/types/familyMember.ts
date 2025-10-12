// types/familyMember.types.ts

// ============================================
// FAMILY MEMBER TYPES
// ============================================
export type RelationshipType = 'spouse' | 'child' | 'parent' | 'sibling' | 'other';

export interface FamilyMember {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  relationship: RelationshipType;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// STATS TYPES
// ============================================
export interface FamilyMemberStats {
  totalMembers: number;
  byRelationship: {
    spouse: number;
    child: number;
    parent: number;
    sibling: number;
    other: number;
  };
}

// ============================================
// REQUEST/DATA TYPES
// ============================================
export interface CreateFamilyMemberRequest {
  firstName: string;
  lastName: string;
  relationship: RelationshipType;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
}

export interface UpdateFamilyMemberData {
  firstName?: string;
  lastName?: string;
  relationship?: RelationshipType;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
}

// ============================================
// FORM VALIDATION TYPES
// ============================================
export interface FamilyMemberFormErrors {
  [key: string]: string | undefined;
  firstName?: string;
  lastName?: string;
  relationship?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

// ============================================
// STATE TYPES
// ============================================
export interface FamilyMemberState {
  members: FamilyMember[];
  currentMember: FamilyMember | null;
  stats: FamilyMemberStats | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface FamilyMemberApiResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

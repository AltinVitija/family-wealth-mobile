/**
 * Utility functions for beneficiary percentage validation
 * Implements the 100% sum requirement from thesis
 */

export interface Beneficiary {
  familyMemberId: string;
  percentage: number;
  conditions?: string;
}

const PERCENTAGE_TOLERANCE = 0.1; // Allow 0.1% tolerance

export interface ValidationResult {
  isValid: boolean;
  sum: number;
  message?: string;
  color: 'success' | 'warning' | 'error';
}

/**
 * Validates that beneficiaries sum to exactly 100%
 */
export const validateBeneficiaryPercentages = (beneficiaries: Beneficiary[]): ValidationResult => {
  if (!beneficiaries || beneficiaries.length === 0) {
    return {
      isValid: true,
      sum: 0,
      message: 'Nuk ka përfitues',
      color: 'warning',
    };
  }

  // Calculate total
  const sum = beneficiaries.reduce((total, b) => {
    const percentage = parseFloat(String(b.percentage)) || 0;
    return total + percentage;
  }, 0);

  // Check individual percentages
  for (const beneficiary of beneficiaries) {
    const percentage = parseFloat(String(beneficiary.percentage)) || 0;
    if (percentage < 0 || percentage > 100) {
      return {
        isValid: false,
        sum,
        message: `Përqindja duhet të jetë ndërmjet 0% dhe 100%`,
        color: 'error',
      };
    }
  }

  const difference = Math.abs(sum - 100);

  // Exact 100%
  if (difference <= PERCENTAGE_TOLERANCE) {
    return {
      isValid: true,
      sum,
      message: `✓ Shuma është 100%`,
      color: 'success',
    };
  }

  // Too high or too low
  const operator = sum > 100 ? '+' : '';
  return {
    isValid: false,
    sum,
    message: `Shuma duhet të jetë 100% (aktualisht: ${sum.toFixed(1)}%, ndryshim: ${operator}${(sum - 100).toFixed(1)}%)`,
    color: 'error',
  };
};

/**
 * Format percentage for display
 */
export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

/**
 * Get color based on sum
 */
export const getSumColor = (sum: number): string => {
  if (Math.abs(sum - 100) <= PERCENTAGE_TOLERANCE) {
    return '#10b981'; // green-500
  }
  if (sum < 100) {
    return '#f59e0b'; // amber-500
  }
  return '#ef4444'; // red-500
};

/**
 * Check if can save (sum is exactly 100%)
 */
export const canSavePlan = (beneficiaries: Beneficiary[]): boolean => {
  const validation = validateBeneficiaryPercentages(beneficiaries);
  return validation.isValid;
};

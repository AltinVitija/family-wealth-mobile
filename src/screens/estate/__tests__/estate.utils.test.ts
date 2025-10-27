/**
 * Unit Tests for Estate Screen Utility Functions
 * These tests verify the core business logic without requiring full component rendering
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Types
interface Asset {
  name: string;
  type: 'property' | 'investment' | 'savings' | 'business' | 'other';
  value: number;
}

interface Beneficiary {
  familyMemberId: string;
  name: string;
  percentage: number;
}

// Utility Functions (extracted from EstateScreenImproved)
export const calculateTotalValue = (assets?: Asset[]): number => {
  if (!assets || assets.length === 0) return 0;
  return assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
};

export const getTotalPercentage = (beneficiaries: Beneficiary[]): number => {
  return beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
};

export const validateBeneficiaries = (
  beneficiaries: Beneficiary[]
): { valid: boolean; message?: string } => {
  if (beneficiaries.length === 0) {
    return { valid: true };
  }

  const total = getTotalPercentage(beneficiaries);

  if (total !== 100) {
    return {
      valid: false,
      message: `Beneficiary percentages must total 100%. Current total: ${total}%`,
    };
  }

  return { valid: true };
};

export const validateEstatePlanForm = (data: {
  title: string;
  beneficiaries: Beneficiary[];
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
  }

  if (data.beneficiaries.length > 0) {
    const beneficiaryValidation = validateBeneficiaries(data.beneficiaries);
    if (!beneficiaryValidation.valid && beneficiaryValidation.message) {
      errors.push(beneficiaryValidation.message);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return '#10B981';
    case 'draft':
      return '#F59E0B';
    case 'archived':
      return '#6B7280';
    default:
      return '#9CA3AF';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Aktiv';
    case 'draft':
      return 'Draft';
    case 'archived':
      return 'Arkivuar';
    default:
      return status;
  }
};

export const mapAssetTypeForAPI = (type: string): string => {
  return type === 'savings' ? 'cash' : type;
};

// Tests
describe('Estate Screen Utilities', () => {
  describe('calculateTotalValue', () => {
    it('returns 0 for empty asset array', () => {
      expect(calculateTotalValue([])).toBe(0);
    });

    it('returns 0 for undefined assets', () => {
      expect(calculateTotalValue(undefined)).toBe(0);
    });

    it('calculates total value correctly for single asset', () => {
      const assets: Asset[] = [{ name: 'House', type: 'property', value: 500000 }];
      expect(calculateTotalValue(assets)).toBe(500000);
    });

    it('calculates total value correctly for multiple assets', () => {
      const assets: Asset[] = [
        { name: 'House', type: 'property', value: 500000 },
        { name: 'Car', type: 'other', value: 30000 },
        { name: 'Savings', type: 'savings', value: 100000 },
      ];
      expect(calculateTotalValue(assets)).toBe(630000);
    });

    it('handles assets with zero value', () => {
      const assets: Asset[] = [
        { name: 'House', type: 'property', value: 500000 },
        { name: 'Empty', type: 'other', value: 0 },
      ];
      expect(calculateTotalValue(assets)).toBe(500000);
    });
  });

  describe('getTotalPercentage', () => {
    it('returns 0 for empty beneficiaries array', () => {
      expect(getTotalPercentage([])).toBe(0);
    });

    it('calculates total percentage correctly for single beneficiary', () => {
      const beneficiaries: Beneficiary[] = [{ familyMemberId: '1', name: 'John', percentage: 100 }];
      expect(getTotalPercentage(beneficiaries)).toBe(100);
    });

    it('calculates total percentage correctly for multiple beneficiaries', () => {
      const beneficiaries: Beneficiary[] = [
        { familyMemberId: '1', name: 'John', percentage: 50 },
        { familyMemberId: '2', name: 'Jane', percentage: 30 },
        { familyMemberId: '3', name: 'Bob', percentage: 20 },
      ];
      expect(getTotalPercentage(beneficiaries)).toBe(100);
    });

    it('handles beneficiaries with zero percentage', () => {
      const beneficiaries: Beneficiary[] = [
        { familyMemberId: '1', name: 'John', percentage: 100 },
        { familyMemberId: '2', name: 'Jane', percentage: 0 },
      ];
      expect(getTotalPercentage(beneficiaries)).toBe(100);
    });
  });

  describe('validateBeneficiaries', () => {
    it('returns valid for empty beneficiaries array', () => {
      const result = validateBeneficiaries([]);
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('returns valid when percentages total 100', () => {
      const beneficiaries: Beneficiary[] = [
        { familyMemberId: '1', name: 'John', percentage: 60 },
        { familyMemberId: '2', name: 'Jane', percentage: 40 },
      ];
      const result = validateBeneficiaries(beneficiaries);
      expect(result.valid).toBe(true);
    });

    it('returns invalid when percentages do not total 100', () => {
      const beneficiaries: Beneficiary[] = [
        { familyMemberId: '1', name: 'John', percentage: 60 },
        { familyMemberId: '2', name: 'Jane', percentage: 30 },
      ];
      const result = validateBeneficiaries(beneficiaries);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('90');
    });

    it('returns invalid when percentages exceed 100', () => {
      const beneficiaries: Beneficiary[] = [
        { familyMemberId: '1', name: 'John', percentage: 60 },
        { familyMemberId: '2', name: 'Jane', percentage: 50 },
      ];
      const result = validateBeneficiaries(beneficiaries);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('110');
    });
  });

  describe('validateEstatePlanForm', () => {
    it('returns valid for properly filled form', () => {
      const formData = {
        title: 'My Estate Plan',
        beneficiaries: [{ familyMemberId: '1', name: 'John', percentage: 100 }],
      };
      const result = validateEstatePlanForm(formData);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('returns invalid when title is empty', () => {
      const formData = {
        title: '',
        beneficiaries: [],
      };
      const result = validateEstatePlanForm(formData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('returns invalid when title is whitespace', () => {
      const formData = {
        title: '   ',
        beneficiaries: [],
      };
      const result = validateEstatePlanForm(formData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('returns invalid when beneficiaries do not total 100%', () => {
      const formData = {
        title: 'My Estate Plan',
        beneficiaries: [{ familyMemberId: '1', name: 'John', percentage: 50 }],
      };
      const result = validateEstatePlanForm(formData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('returns multiple errors when multiple validations fail', () => {
      const formData = {
        title: '',
        beneficiaries: [{ familyMemberId: '1', name: 'John', percentage: 50 }],
      };
      const result = validateEstatePlanForm(formData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2);
    });
  });

  describe('formatCurrency', () => {
    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toContain('0');
    });

    it('formats positive numbers correctly', () => {
      const formatted = formatCurrency(1000);
      expect(formatted).toContain('1,000');
    });

    it('formats large numbers correctly', () => {
      const formatted = formatCurrency(1000000);
      expect(formatted).toContain('1,000,000');
    });

    it('formats decimal numbers correctly', () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toContain('1,234.56');
    });
  });

  describe('getStatusColor', () => {
    it('returns green for active status', () => {
      expect(getStatusColor('active')).toBe('#10B981');
    });

    it('returns orange for draft status', () => {
      expect(getStatusColor('draft')).toBe('#F59E0B');
    });

    it('returns gray for archived status', () => {
      expect(getStatusColor('archived')).toBe('#6B7280');
    });

    it('returns default gray for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('#9CA3AF');
    });
  });

  describe('getStatusLabel', () => {
    it('returns Albanian label for active', () => {
      expect(getStatusLabel('active')).toBe('Aktiv');
    });

    it('returns Albanian label for draft', () => {
      expect(getStatusLabel('draft')).toBe('Draft');
    });

    it('returns Albanian label for archived', () => {
      expect(getStatusLabel('archived')).toBe('Arkivuar');
    });

    it('returns original value for unknown status', () => {
      expect(getStatusLabel('unknown')).toBe('unknown');
    });
  });

  describe('mapAssetTypeForAPI', () => {
    it('maps savings to cash', () => {
      expect(mapAssetTypeForAPI('savings')).toBe('cash');
    });

    it('keeps property unchanged', () => {
      expect(mapAssetTypeForAPI('property')).toBe('property');
    });

    it('keeps investment unchanged', () => {
      expect(mapAssetTypeForAPI('investment')).toBe('investment');
    });

    it('keeps other unchanged', () => {
      expect(mapAssetTypeForAPI('other')).toBe('other');
    });

    it('keeps business unchanged', () => {
      expect(mapAssetTypeForAPI('business')).toBe('business');
    });
  });
});

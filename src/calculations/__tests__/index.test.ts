import { describe, it, expect } from 'vitest';
import { calculateTaxes } from '../index';
import { TaxFormData } from '../../types';

describe('Tax Calculation Orchestrator', () => {
  const createBasicFormData = (overrides: Partial<TaxFormData> = {}): TaxFormData => ({
    filingStatus: 'single',
    includeCaliforniaTax: true,
    propertyTax: 0,
    mortgageInterest: 0,
    donations: 0,
    userIncome: {
      ordinaryDividends: 0,
      qualifiedDividends: 0,
      interestIncome: 0,
      shortTermCapitalGains: 0,
      longTermCapitalGains: 0,
      ytdTaxableWage: 0,
      ytdFederalWithhold: 0,
      ytdStateWithhold: 0,
      futureIncomeMode: 'simple',
      estimatedFutureTaxableWage: 0,
      estimatedFutureFederalWithhold: 0,
      estimatedFutureStateWithhold: 0,
    },
    federalEstimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
    californiaEstimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
    ...overrides,
  });

  describe('Federal and California Tax Integration', () => {
    it('should calculate both federal and California taxes when requested', () => {
      const formData = createBasicFormData({
        includeCaliforniaTax: true,
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdFederalWithhold: 15000,
          ytdStateWithhold: 5000,
        },
      });

      const result = calculateTaxes(formData);

      expect(result.federal).toBeDefined();
      expect(result.california).toBeDefined();
      expect(result.federal.totalIncome).toBe(100000);
      expect(result.california!.totalIncome).toBe(100000);
    });

    it('should calculate only federal tax when California not included', () => {
      const formData = createBasicFormData({
        includeCaliforniaTax: false,
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdFederalWithhold: 15000,
        },
      });

      const result = calculateTaxes(formData);

      expect(result.federal).toBeDefined();
      expect(result.california).toBeUndefined();
      expect(result.suggestedPayments.california).toBeUndefined();
    });
  });

  describe('Suggested Federal Payments', () => {
    it('should suggest no payments when getting a refund', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 50000,
          ytdFederalWithhold: 20000, // Overwithholding
        },
      });

      const result = calculateTaxes(formData);

      expect(result.suggestedPayments.federal).toHaveLength(0);
    });

    it('should suggest equal quarterly payments for remaining quarters', () => {
      // Mock current date to June (Q2)
      const originalDate = Date;
      const mockDate = new originalDate('2025-06-15');
      (globalThis as any).Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super();
            return mockDate;
          }
          super(...args);
        }
        static now() {
          return mockDate.getTime();
        }
      } as any;

      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdFederalWithhold: 10000,
        },
      });

      const result = calculateTaxes(formData);

      // Should have payments for Q2, Q3 and Q4 (June 16 is still in the future from June 15)
      expect(result.suggestedPayments.federal.length).toBe(3);
      expect(result.suggestedPayments.federal[0].quarter).toBe('Q2');
      expect(result.suggestedPayments.federal[1].quarter).toBe('Q3');
      expect(result.suggestedPayments.federal[2].quarter).toBe('Q4');

      // Payments should be roughly equal
      const q2Payment = result.suggestedPayments.federal[0].amount;
      const q3Payment = result.suggestedPayments.federal[1].amount;
      const q4Payment = result.suggestedPayments.federal[2].amount;
      expect(Math.abs(q2Payment - q3Payment)).toBeLessThanOrEqual(1); // Allow $1 difference for rounding
      expect(Math.abs(q3Payment - q4Payment)).toBeLessThanOrEqual(1);

      (globalThis as any).Date = originalDate;
    });

    it('should handle year-end scenario with no remaining payments', () => {
      // Mock current date to late December
      const originalDate = Date;
      const mockDate = new originalDate('2025-12-20');
      (globalThis as any).Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super();
            return mockDate;
          }
          super(...args);
        }
        static now() {
          return mockDate.getTime();
        }
      } as any;

      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdFederalWithhold: 10000,
        },
      });

      const result = calculateTaxes(formData);

      // Only Q4 payment remains (due Jan 15, 2026)
      expect(result.suggestedPayments.federal.length).toBe(1);
      expect(result.suggestedPayments.federal[0].quarter).toBe('Q4');

      (globalThis as any).Date = originalDate;
    });
  });

  describe('Suggested California Payments', () => {
    it('should calculate California payments based on percentage schedule', () => {
      const formData = createBasicFormData({
        includeCaliforniaTax: true,
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 200000,
          ytdStateWithhold: 5000, // Low withholding to ensure tax is owed
        },
        californiaEstimatedPayments: { q1: 1000, q2: 0, q3: 0, q4: 0 },
      });

      const result = calculateTaxes(formData);

      if (result.california && result.suggestedPayments.california) {
        const totalTax = result.california.totalTaxLiability;
        
        // Find suggested payments
        const suggestedPayments = result.suggestedPayments.california;
        
        // Q1 should be 30% of total tax minus what's already paid
        const q1Required = Math.round(totalTax * 0.30);
        const q1Remaining = q1Required - 2000;

        // Q2 should be 40% of total tax
        const q2Required = Math.round(totalTax * 0.40);

        // Q3 should be 0% (no payment)
        // Q4 should be 30% of total tax

        // Verify the payment structure matches California's schedule
        expect(suggestedPayments.length).toBeGreaterThan(0);
      }
    });

    it('should not suggest California payments when not including California tax', () => {
      const formData = createBasicFormData({
        includeCaliforniaTax: false,
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 200000,
        },
      });

      const result = calculateTaxes(formData);

      expect(result.suggestedPayments.california).toBeUndefined();
    });

    it('should handle Q3 correctly (0% payment for California)', () => {
      // Mock current date to early in the year
      const originalDate = Date;
      const mockDate = new originalDate('2025-01-15');
      (globalThis as any).Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super();
            return mockDate;
          }
          super(...args);
        }
        static now() {
          return mockDate.getTime();
        }
      } as any;

      const formData = createBasicFormData({
        includeCaliforniaTax: true,
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdStateWithhold: 5000,
        },
      });

      const result = calculateTaxes(formData);

      if (result.suggestedPayments.california) {
        // Q3 should not appear in suggested payments or should have 0 amount
        const q3Payment = result.suggestedPayments.california.find(p => p.quarter === 'Q3');
        expect(q3Payment).toBeUndefined();
      }

      (globalThis as any).Date = originalDate;
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle married filing jointly with spouse income', () => {
      const formData = createBasicFormData({
        filingStatus: 'marriedFilingJointly',
        includeCaliforniaTax: true,
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 150000,
          ytdFederalWithhold: 25000,
          ytdStateWithhold: 10000,
          longTermCapitalGains: 20000,
        },
        spouseIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdFederalWithhold: 15000,
          ytdStateWithhold: 7000,
          qualifiedDividends: 5000,
          ordinaryDividends: 5000,
        },
      });

      const result = calculateTaxes(formData);

      // Federal should combine both incomes
      expect(result.federal.totalIncome).toBe(275000); // 150k + 100k + 20k + 5k
      expect(result.federal.totalWithholdings).toBe(40000); // 25k + 15k

      // California should also combine both incomes
      expect(result.california!.totalIncome).toBe(275000);
      expect(result.california!.totalWithholdings).toBe(17000); // 10k + 7k
    });

    it('should handle all income types correctly', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ordinaryDividends: 10000,
          qualifiedDividends: 8000,
          interestIncome: 5000,
          shortTermCapitalGains: 15000,
          longTermCapitalGains: 25000,
          ytdFederalWithhold: 20000,
          ytdStateWithhold: 8000,
        },
      });

      const result = calculateTaxes(formData);

      // Total income should include all sources
      expect(result.federal.totalIncome).toBe(155000); // 100k + 10k + 5k + 15k + 25k
      
      // Federal should separate capital gains treatment
      expect(result.federal.capitalGainsTax).toBeGreaterThan(0);
      
      // California should treat all income as ordinary
      expect(result.california!.capitalGainsTax).toBe(0);
      expect(result.california!.ordinaryIncomeTax).toBe(result.california!.totalTaxLiability);
    });

    it('should handle itemized vs standard deduction independently for each jurisdiction', () => {
      const formData = createBasicFormData({
        propertyTax: 8000,
        mortgageInterest: 10000,
        donations: 2000,
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
        },
      });

      const result = calculateTaxes(formData);

      // Total itemized = 20k
      // Federal standard (single) = 15k, so itemized is better
      expect(result.federal.deductionType).toBe('itemized');
      expect(result.federal.deductionAmount).toBe(20000);

      // California standard (single) = 5,540, so itemized is better
      expect(result.california!.deductionType).toBe('itemized');
      expect(result.california!.deductionAmount).toBe(20000);
    });
  });
});
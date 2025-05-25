import { describe, it, expect } from 'vitest';
import {
  calculateProgressiveTax,
  getCapitalGainsRate,
  getMarginalTaxRate,
  getEffectiveTaxRate,
  getBestDeduction,
  calculateFuturePaycheckIncome,
  calculateRSUWithholding,
  TaxBracket,
} from '../taxCalculations';

describe('Tax Calculation Utilities', () => {
  describe('calculateProgressiveTax', () => {
    const testBrackets: TaxBracket[] = [
      { min: 0, max: 10000, rate: 0.10 },
      { min: 10001, max: 50000, rate: 0.20 },
      { min: 50001, max: 100000, rate: 0.30 },
      { min: 100001, max: Infinity, rate: 0.40 },
    ];

    it('should calculate tax for income in first bracket', () => {
      const tax = calculateProgressiveTax(5000, testBrackets);
      expect(tax).toBe(500); // 5000 * 0.10
    });

    it('should calculate tax across multiple brackets', () => {
      const tax = calculateProgressiveTax(75000, testBrackets);
      // 10000 * 0.10 = 1000
      // 40000 * 0.20 = 8000
      // 25000 * 0.30 = 7500
      // Total = 16500
      expect(tax).toBe(16500);
    });

    it('should handle income in highest bracket', () => {
      const tax = calculateProgressiveTax(150000, testBrackets);
      // 10000 * 0.10 = 1000
      // 40000 * 0.20 = 8000
      // 50000 * 0.30 = 15000
      // 50000 * 0.40 = 20000
      // Total = 44000
      expect(tax).toBe(44000);
    });

    it('should handle zero income', () => {
      const tax = calculateProgressiveTax(0, testBrackets);
      expect(tax).toBe(0);
    });

    it('should handle income exactly at bracket boundary', () => {
      const tax = calculateProgressiveTax(10000, testBrackets);
      expect(tax).toBe(1000); // 10000 * 0.10
    });
  });

  describe('getCapitalGainsRate', () => {
    const capitalGainsBrackets: TaxBracket[] = [
      { min: 0, max: 50000, rate: 0 },
      { min: 50001, max: 500000, rate: 0.15 },
      { min: 500001, max: Infinity, rate: 0.20 },
    ];

    it('should return 0% rate for low income', () => {
      const rate = getCapitalGainsRate(30000, capitalGainsBrackets);
      expect(rate).toBe(0);
    });

    it('should return 15% rate for middle income', () => {
      const rate = getCapitalGainsRate(200000, capitalGainsBrackets);
      expect(rate).toBe(0.15);
    });

    it('should return 20% rate for high income', () => {
      const rate = getCapitalGainsRate(600000, capitalGainsBrackets);
      expect(rate).toBe(0.20);
    });

    it('should handle income at bracket boundary', () => {
      const rate = getCapitalGainsRate(50000, capitalGainsBrackets);
      expect(rate).toBe(0);
    });
  });

  describe('getMarginalTaxRate', () => {
    const brackets: TaxBracket[] = [
      { min: 0, max: 10000, rate: 0.10 },
      { min: 10001, max: 50000, rate: 0.22 },
      { min: 50001, max: Infinity, rate: 0.35 },
    ];

    it('should return correct marginal rate for each bracket', () => {
      expect(getMarginalTaxRate(5000, brackets)).toBeCloseTo(0.10, 5);
      expect(getMarginalTaxRate(25000, brackets)).toBeCloseTo(0.22, 5);
      expect(getMarginalTaxRate(75000, brackets)).toBeCloseTo(0.35, 5);
    });

    it('should handle zero income', () => {
      expect(getMarginalTaxRate(0, brackets)).toBeCloseTo(0.10, 5);
    });

    it('should handle income at bracket boundary', () => {
      expect(getMarginalTaxRate(10000, brackets)).toBeCloseTo(0.10, 5);
      expect(getMarginalTaxRate(10001, brackets)).toBeCloseTo(0.22, 5);
    });
  });

  describe('getEffectiveTaxRate', () => {
    it('should calculate effective tax rate correctly', () => {
      const effectiveRate = getEffectiveTaxRate(15000, 100000);
      expect(effectiveRate).toBe(15); // 15%
    });

    it('should handle zero income', () => {
      const effectiveRate = getEffectiveTaxRate(0, 0);
      expect(effectiveRate).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const effectiveRate = getEffectiveTaxRate(15678, 100000);
      expect(effectiveRate).toBe(15.68);
    });

    it('should handle very small rates', () => {
      const effectiveRate = getEffectiveTaxRate(100, 1000000);
      expect(effectiveRate).toBe(0.01);
    });
  });

  describe('getBestDeduction', () => {
    it('should choose standard deduction when higher', () => {
      const result = getBestDeduction(12000, 8000);
      expect(result.type).toBe('standard');
      expect(result.amount).toBe(12000);
    });

    it('should choose itemized deduction when higher', () => {
      const result = getBestDeduction(12000, 15000);
      expect(result.type).toBe('itemized');
      expect(result.amount).toBe(15000);
    });

    it('should choose standard when equal', () => {
      const result = getBestDeduction(12000, 12000);
      expect(result.type).toBe('standard');
      expect(result.amount).toBe(12000);
    });

    it('should handle zero deductions', () => {
      const result = getBestDeduction(0, 0);
      expect(result.type).toBe('standard');
      expect(result.amount).toBe(0);
    });
  });

  describe('calculateFuturePaycheckIncome', () => {
    it('should calculate biweekly paychecks correctly', () => {
      const today = new Date('2025-06-01');
      const result = calculateFuturePaycheckIncome(
        {
          taxableWagePerPaycheck: 5000,
          federalWithholdPerPaycheck: 1000,
          stateWithholdPerPaycheck: 300,
          paymentFrequency: 'biweekly',
          nextPaymentDate: '2025-06-15',
        },
        today
      );

      // From June 15 to Dec 31, there should be about 13-15 biweekly payments
      expect(result.futureTaxableWage).toBeGreaterThan(60000);
      expect(result.futureTaxableWage).toBeLessThan(80000);
      expect(result.futureFederalWithhold).toBeGreaterThan(12000);
      expect(result.futureFederalWithhold).toBeLessThan(16000);
    });

    it('should calculate monthly paychecks correctly', () => {
      const today = new Date('2025-06-01');
      const result = calculateFuturePaycheckIncome(
        {
          taxableWagePerPaycheck: 10000,
          federalWithholdPerPaycheck: 2000,
          stateWithholdPerPaycheck: 600,
          paymentFrequency: 'monthly',
          nextPaymentDate: '2025-06-30',
        },
        today
      );

      // From June 30 to Dec 31, there should be 7 monthly payments
      expect(result.futureTaxableWage).toBeGreaterThan(60000);
      expect(result.futureTaxableWage).toBeLessThan(80000);
    });

    it('should handle next payment date in the past', () => {
      const today = new Date('2025-06-01');
      const result = calculateFuturePaycheckIncome(
        {
          taxableWagePerPaycheck: 5000,
          federalWithholdPerPaycheck: 1000,
          stateWithholdPerPaycheck: 300,
          paymentFrequency: 'biweekly',
          nextPaymentDate: '2025-05-01',
        },
        today
      );

      // Should start counting from the past date
      expect(result.futureTaxableWage).toBeGreaterThan(0);
    });

    it('should handle end of year correctly', () => {
      const today = new Date('2025-12-20');
      const result = calculateFuturePaycheckIncome(
        {
          taxableWagePerPaycheck: 5000,
          federalWithholdPerPaycheck: 1000,
          stateWithholdPerPaycheck: 300,
          paymentFrequency: 'biweekly',
          nextPaymentDate: '2025-12-25',
        },
        today
      );

      // Should only count payments before year end
      expect(result.futureTaxableWage).toBe(5000); // Only one payment
    });
  });

  describe('calculateRSUWithholding', () => {
    it('should calculate standard 22% federal withholding', () => {
      const result = calculateRSUWithholding(100000, false);
      expect(result.federalWithhold).toBe(22000); // 22%
      expect(result.californiaWithhold).toBe(10230); // 10.23%
    });

    it('should calculate 37% federal withholding for high earners', () => {
      const result = calculateRSUWithholding(2000000, true);
      expect(result.federalWithhold).toBe(740000); // 37%
      expect(result.californiaWithhold).toBe(204600); // 10.23%
    });

    it('should handle zero vest value', () => {
      const result = calculateRSUWithholding(0, false);
      expect(result.federalWithhold).toBe(0);
      expect(result.californiaWithhold).toBe(0);
    });

    it('should round withholding amounts', () => {
      const result = calculateRSUWithholding(12345.67, false);
      expect(result.federalWithhold).toBe(2716); // Rounded from 2716.0474
      expect(result.californiaWithhold).toBe(1263); // Rounded from 1262.962
    });
  });
});
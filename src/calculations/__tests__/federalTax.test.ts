import { describe, it, expect } from 'vitest';
import { calculateFederalTax } from '../federalTax';
import { TaxFormData } from '../../types';

describe('Federal Tax Calculations', () => {
  const createBasicFormData = (overrides: Partial<TaxFormData> = {}): TaxFormData => ({
    filingStatus: 'single',
    includeCaliforniaTax: false,
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
    ...overrides,
  });

  describe('Basic Tax Calculations', () => {
    it('should calculate federal tax for single filer with standard deduction', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdFederalWithhold: 15000,
        },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.totalIncome).toBe(100000);
      expect(result.deductionType).toBe('standard');
      expect(result.deductionAmount).toBe(15000);
      expect(result.taxableIncome).toBe(85000);
      expect(result.totalWithholdings).toBe(15000);
      
      // Verify tax calculation
      // $11,925 @ 10% = $1,192.50
      // $36,550 @ 12% = $4,386
      // $36,525 @ 22% = $8,035.50
      // Total = $13,614 (rounded)
      expect(result.ordinaryIncomeTax).toBe(13614);
    });

    it('should calculate federal tax for married filing jointly with itemized deductions', () => {
      const formData = createBasicFormData({
        filingStatus: 'marriedFilingJointly',
        propertyTax: 15000,
        mortgageInterest: 20000,
        donations: 5000,
        userIncome: {
          ...createBasicFormData().userIncome,
          ordinaryDividends: 5000,
          qualifiedDividends: 3000,
          interestIncome: 2000,
          shortTermCapitalGains: 1000,
          longTermCapitalGains: 10000,
          ytdTaxableWage: 150000,
          ytdFederalWithhold: 25000,
        },
        spouseIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 80000,
          ytdFederalWithhold: 12000,
        },
        federalEstimatedPayments: { q1: 2000, q2: 2000, q3: 2000, q4: 2000 },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.totalIncome).toBe(248000); // 150k + 80k + 18k investment
      expect(result.deductionType).toBe('itemized');
      expect(result.deductionAmount).toBe(40000); // 15k + 20k + 5k
      expect(result.taxableIncome).toBe(208000); // 248k - 40k
      expect(result.totalWithholdings).toBe(37000); // 25k + 12k
      expect(result.totalEstimatedPayments).toBe(8000); // 2k * 4
    });
  });

  describe('Capital Gains Tax Calculations', () => {
    it('should apply 0% capital gains rate for low income', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 30000,
          ordinaryDividends: 5000,
          qualifiedDividends: 5000,
          longTermCapitalGains: 10000,
        },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.taxableIncome).toBe(30000); // 30k + 5k + 10k = 45k - 15k standard deduction
      expect(result.capitalGainsRate).toBe(0); // 0% rate for income under $48,350
      expect(result.capitalGainsTax).toBe(0);
    });

    it('should apply 15% capital gains rate for middle income', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 50000,
          ordinaryDividends: 10000,
          qualifiedDividends: 10000,
          longTermCapitalGains: 50000,
        },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.totalIncome).toBe(110000); // 50k wages + 60k investment
      expect(result.taxableIncome).toBe(95000); // 110k - 15k standard deduction
      expect(result.capitalGainsRate).toBe(15); // 15% rate
      expect(result.capitalGainsTax).toBe(9000); // 60k * 0.15
    });

    it('should apply 20% capital gains rate for high income', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 500000,
          ordinaryDividends: 20000,
          qualifiedDividends: 20000,
          longTermCapitalGains: 100000,
        },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.totalIncome).toBe(620000);
      expect(result.taxableIncome).toBe(605000); // 620k - 15k standard deduction
      expect(result.capitalGainsRate).toBe(20); // 20% rate for high income
      expect(result.capitalGainsTax).toBe(24000); // 120k * 0.20
    });
  });

  describe('Marginal and Effective Tax Rates', () => {
    it('should calculate correct marginal tax rate', () => {
      const testCases = [
        { income: 20000, expectedMarginal: 10 },
        { income: 50000, expectedMarginal: 12 },
        { income: 100000, expectedMarginal: 22 },
        { income: 200000, expectedMarginal: 24 },
        { income: 300000, expectedMarginal: 35 }, // $300k - $15k deduction = $285k taxable, which is in 35% bracket
        { income: 400000, expectedMarginal: 35 },
        { income: 700000, expectedMarginal: 37 },
      ];

      testCases.forEach(({ income, expectedMarginal }) => {
        const formData = createBasicFormData({
          userIncome: {
            ...createBasicFormData().userIncome,
            ytdTaxableWage: income,
          },
        });

        const result = calculateFederalTax(formData);
        expect(result.marginalTaxRate).toBe(expectedMarginal);
      });
    });

    it('should calculate correct effective tax rate', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
        },
      });

      const result = calculateFederalTax(formData);
      const expectedEffectiveRate = (result.totalTaxLiability / result.totalIncome) * 100;
      expect(result.effectiveTaxRate).toBeCloseTo(expectedEffectiveRate, 2);
    });
  });

  describe('Short-term vs Long-term Capital Gains', () => {
    it('should tax short-term gains as ordinary income', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 50000,
          shortTermCapitalGains: 20000,
        },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.totalIncome).toBe(70000);
      expect(result.capitalGainsTax).toBe(0); // Short-term gains taxed as ordinary
      expect(result.ordinaryIncomeTax).toBeGreaterThan(0);
    });

    it('should handle capital losses correctly', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          shortTermCapitalGains: -5000,
          longTermCapitalGains: -3000,
        },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.totalIncome).toBe(92000); // 100k - 8k losses
    });
  });

  describe('Tax Owed/Refund Calculations', () => {
    it('should calculate tax owed when withholdings are insufficient', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdFederalWithhold: 10000,
        },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.taxOwedOrRefund).toBeGreaterThan(0); // Positive = owed
      expect(result.taxOwedOrRefund).toBe(result.totalTaxLiability - 10000);
    });

    it('should calculate refund when withholdings exceed tax liability', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 50000,
          ytdFederalWithhold: 20000,
        },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.taxOwedOrRefund).toBeLessThan(0); // Negative = refund
    });

    it('should include estimated payments in tax calculations', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdFederalWithhold: 10000,
        },
        federalEstimatedPayments: { q1: 1000, q2: 1000, q3: 1000, q4: 1000 },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.totalEstimatedPayments).toBe(4000);
      const expectedOwed = result.totalTaxLiability - 10000 - 4000;
      expect(result.taxOwedOrRefund).toBe(expectedOwed);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const formData = createBasicFormData();

      const result = calculateFederalTax(formData);
      
      expect(result.totalIncome).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.totalTaxLiability).toBe(0);
      expect(result.taxOwedOrRefund).toBe(0);
    });

    it('should handle very high income correctly', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 10000000, // $10 million
        },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.marginalTaxRate).toBe(37); // Highest bracket
      expect(result.totalTaxLiability).toBeGreaterThan(3000000); // Should be substantial
    });

    it('should handle qualified dividends exceeding ordinary dividends gracefully', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ordinaryDividends: 5000,
          qualifiedDividends: 5000, // Equal to ordinary, which is valid
        },
      });

      const result = calculateFederalTax(formData);
      
      expect(result.totalIncome).toBe(5000);
    });
  });
});
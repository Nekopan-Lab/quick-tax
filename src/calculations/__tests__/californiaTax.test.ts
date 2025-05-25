import { describe, it, expect } from 'vitest';
import { calculateCaliforniaTax } from '../californiaTax';
import { TaxFormData } from '../../types';

describe('California Tax Calculations', () => {
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

  describe('Basic Tax Calculations', () => {
    it('should calculate California tax for single filer with standard deduction', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 75000,
          ytdStateWithhold: 5000,
        },
      });

      const result = calculateCaliforniaTax(formData);
      
      expect(result.totalIncome).toBe(75000);
      expect(result.deductionType).toBe('standard');
      expect(result.deductionAmount).toBe(5540);
      expect(result.taxableIncome).toBe(69460); // 75000 - 5540
      expect(result.totalWithholdings).toBe(5000);
      expect(result.capitalGainsTax).toBe(0); // CA doesn't have separate capital gains rates
    });

    it('should calculate California tax for married filing jointly', () => {
      const formData = createBasicFormData({
        filingStatus: 'marriedFilingJointly',
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 150000,
          ytdStateWithhold: 10000,
        },
        spouseIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdStateWithhold: 7000,
        },
      });

      const result = calculateCaliforniaTax(formData);
      
      expect(result.totalIncome).toBe(250000);
      expect(result.deductionType).toBe('standard');
      expect(result.deductionAmount).toBe(11080);
      expect(result.taxableIncome).toBe(238920); // 250000 - 11080
      expect(result.totalWithholdings).toBe(17000);
    });
  });

  describe('California Capital Gains Treatment', () => {
    it('should tax all capital gains as ordinary income', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 50000,
          longTermCapitalGains: 50000,
          shortTermCapitalGains: 10000,
          qualifiedDividends: 5000,
        },
      });

      const result = calculateCaliforniaTax(formData);
      
      expect(result.totalIncome).toBe(110000); // 50k + 5k ord div + 2k int + 1k short + 10k long + 50k gains = 118k - 8k already counted in qualified = 110k
      expect(result.capitalGainsTax).toBe(0); // No separate capital gains calculation
      expect(result.ordinaryIncomeTax).toBe(result.totalTaxLiability); // All tax is "ordinary"
    });
  });

  describe('Mental Health Tax', () => {
    it('should apply 1% mental health tax on income over $1 million', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 1500000,
        },
      });

      const result = calculateCaliforniaTax(formData);
      
      expect(result.taxableIncome).toBe(1494460); // 1.5M - 5540 standard deduction
      expect(result.marginalTaxRate).toBe(13.3); // 12.3% + 1% mental health
      
      // Tax should include the mental health tax on amount over $1M
      const incomeOverMillion = result.taxableIncome - 1000000;
      const mentalHealthTax = incomeOverMillion * 0.01;
      expect(result.totalTaxLiability).toBeGreaterThan(mentalHealthTax);
    });

    it('should not apply mental health tax on income under $1 million', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 900000,
        },
      });

      const result = calculateCaliforniaTax(formData);
      
      expect(result.marginalTaxRate).toBe(12.3); // 12.3% bracket for income between $721k-$1M
    });
  });

  describe('Marginal Tax Rates', () => {
    it('should calculate correct marginal tax rates for single filers', () => {
      const testCases = [
        { income: 10000, expectedMarginal: 1 },
        { income: 20000, expectedMarginal: 2 },
        { income: 35000, expectedMarginal: 4 },
        { income: 50000, expectedMarginal: 6 },
        { income: 65000, expectedMarginal: 8 },
        { income: 200000, expectedMarginal: 9.3 },
        { income: 400000, expectedMarginal: 10.3 },
        { income: 600000, expectedMarginal: 11.3 },
        { income: 800000, expectedMarginal: 12.3 },
        { income: 1500000, expectedMarginal: 13.3 },
      ];

      testCases.forEach(({ income, expectedMarginal }) => {
        const formData = createBasicFormData({
          userIncome: {
            ...createBasicFormData().userIncome,
            ytdTaxableWage: income,
          },
        });

        const result = calculateCaliforniaTax(formData);
        expect(result.marginalTaxRate).toBeCloseTo(expectedMarginal, 1);
      });
    });

    it('should calculate correct marginal tax rates for married filing jointly', () => {
      const testCases = [
        { income: 20000, expectedMarginal: 1 },
        { income: 40000, expectedMarginal: 2 },
        { income: 70000, expectedMarginal: 4 },
        { income: 100000, expectedMarginal: 6 },
        { income: 130000, expectedMarginal: 8 },
        { income: 400000, expectedMarginal: 9.3 },
        { income: 800000, expectedMarginal: 10.3 },
        { income: 1200000, expectedMarginal: 11.3 },
        { income: 1600000, expectedMarginal: 12.3 },
        { income: 2500000, expectedMarginal: 13.3 },
      ];

      testCases.forEach(({ income, expectedMarginal }) => {
        const formData = createBasicFormData({
          filingStatus: 'marriedFilingJointly',
          userIncome: {
            ...createBasicFormData().userIncome,
            ytdTaxableWage: income,
          },
        });

        const result = calculateCaliforniaTax(formData);
        expect(result.marginalTaxRate).toBeCloseTo(expectedMarginal, 1);
      });
    });
  });

  describe('Deduction Comparisons', () => {
    it('should use itemized deductions when beneficial', () => {
      const formData = createBasicFormData({
        propertyTax: 10000,
        mortgageInterest: 15000,
        donations: 5000,
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
        },
      });

      const result = calculateCaliforniaTax(formData);
      
      expect(result.deductionType).toBe('itemized');
      expect(result.deductionAmount).toBe(30000); // 10k + 15k + 5k
    });

    it('should use standard deduction when beneficial', () => {
      const formData = createBasicFormData({
        propertyTax: 1000,
        mortgageInterest: 2000,
        donations: 500,
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
        },
      });

      const result = calculateCaliforniaTax(formData);
      
      expect(result.deductionType).toBe('standard');
      expect(result.deductionAmount).toBe(5540);
    });
  });

  describe('Estimated Payments', () => {
    it('should calculate total estimated payments correctly', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdStateWithhold: 5000,
        },
        californiaEstimatedPayments: { q1: 1500, q2: 2000, q3: 0, q4: 1500 },
      });

      const result = calculateCaliforniaTax(formData);
      
      expect(result.totalEstimatedPayments).toBe(5000); // 1500 + 2000 + 0 + 1500
    });

    it('should calculate tax owed when payments are insufficient', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          ytdStateWithhold: 2000,
        },
        californiaEstimatedPayments: { q1: 500, q2: 500, q3: 0, q4: 500 },
      });

      const result = calculateCaliforniaTax(formData);
      
      expect(result.totalWithholdings).toBe(2000);
      expect(result.totalEstimatedPayments).toBe(1500);
      expect(result.taxOwedOrRefund).toBeGreaterThan(0); // Should owe tax
    });
  });

  describe('Investment Income', () => {
    it('should include all investment income as ordinary income', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 50000,
          ordinaryDividends: 5000,
          qualifiedDividends: 3000, // Subset of ordinary
          interestIncome: 2000,
          shortTermCapitalGains: 10000,
          longTermCapitalGains: 20000,
        },
      });

      const result = calculateCaliforniaTax(formData);
      
      // Total should be wages + all investment income
      expect(result.totalIncome).toBe(87000); // 50k + 5k + 2k + 10k + 20k
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const formData = createBasicFormData();

      const result = calculateCaliforniaTax(formData);
      
      expect(result.totalIncome).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.totalTaxLiability).toBe(0);
      expect(result.taxOwedOrRefund).toBe(0);
    });

    it('should handle negative income (losses)', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 100000,
          shortTermCapitalGains: -20000,
          longTermCapitalGains: -10000,
        },
      });

      const result = calculateCaliforniaTax(formData);
      
      expect(result.totalIncome).toBe(70000); // 100k - 30k losses
    });

    it('should handle very high income with mental health tax', () => {
      const formData = createBasicFormData({
        userIncome: {
          ...createBasicFormData().userIncome,
          ytdTaxableWage: 5000000, // $5 million
        },
      });

      const result = calculateCaliforniaTax(formData);
      
      expect(result.marginalTaxRate).toBe(13.3); // Highest rate including mental health
      expect(result.totalTaxLiability).toBeGreaterThan(600000); // Should be substantial
    });
  });
});
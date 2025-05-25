import { describe, it, expect } from 'vitest';
import {
  validatePositiveNumber,
  validateQualifiedDividends,
  validateDate,
  validateFutureDate,
  validateStockPrice,
  validateTaxPayment,
  validateIncome,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validatePositiveNumber', () => {
    it('should accept positive numbers', () => {
      const result = validatePositiveNumber(100, 'Test Field');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept zero', () => {
      const result = validatePositiveNumber(0, 'Test Field');
      expect(result.isValid).toBe(true);
    });

    it('should reject negative numbers', () => {
      const result = validatePositiveNumber(-10, 'Test Field');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Test Field must be a positive number');
    });
  });

  describe('validateQualifiedDividends', () => {
    it('should accept qualified dividends less than ordinary', () => {
      const result = validateQualifiedDividends(3000, 5000);
      expect(result.isValid).toBe(true);
    });

    it('should accept qualified dividends equal to ordinary', () => {
      const result = validateQualifiedDividends(5000, 5000);
      expect(result.isValid).toBe(true);
    });

    it('should reject qualified dividends greater than ordinary', () => {
      const result = validateQualifiedDividends(6000, 5000);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Qualified dividends cannot exceed ordinary dividends');
    });

    it('should handle zero values', () => {
      const result = validateQualifiedDividends(0, 0);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateDate', () => {
    it('should accept valid date strings', () => {
      const result = validateDate('2025-06-15', 'Test Date');
      expect(result.isValid).toBe(true);
    });

    it('should accept date in ISO format', () => {
      const result = validateDate('2025-12-31T23:59:59', 'Test Date');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid date strings', () => {
      const result = validateDate('not-a-date', 'Test Date');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Test Date must be a valid date');
    });

    it('should reject empty strings', () => {
      const result = validateDate('', 'Test Date');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateFutureDate', () => {
    it('should accept future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const result = validateFutureDate(futureDate.toISOString(), 'Payment Date');
      expect(result.isValid).toBe(true);
    });

    it('should accept today as a future date', () => {
      const today = new Date();
      const result = validateFutureDate(today.toISOString(), 'Payment Date');
      expect(result.isValid).toBe(true);
    });

    it('should reject past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const result = validateFutureDate(pastDate.toISOString(), 'Payment Date');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Payment Date must be in the future');
    });

    it('should reject invalid dates', () => {
      const result = validateFutureDate('invalid', 'Payment Date');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Payment Date must be a valid date');
    });
  });

  describe('validateStockPrice', () => {
    it('should accept reasonable stock prices', () => {
      const testCases = [0, 1, 100, 1000, 9999];
      testCases.forEach(price => {
        const result = validateStockPrice(price);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject negative stock prices', () => {
      const result = validateStockPrice(-10);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Stock price must be positive');
    });

    it('should reject unreasonably high stock prices', () => {
      const result = validateStockPrice(15000);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Stock price seems unreasonably high (> $10,000)');
    });

    it('should accept exactly $10,000', () => {
      const result = validateStockPrice(10000);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateTaxPayment', () => {
    it('should accept reasonable tax payments', () => {
      const testCases = [0, 100, 5000, 50000, 500000];
      testCases.forEach(payment => {
        const result = validateTaxPayment(payment, 'Q1');
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject negative payments', () => {
      const result = validateTaxPayment(-100, 'Q2');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Q2 payment cannot be negative');
    });

    it('should reject unreasonably high payments', () => {
      const result = validateTaxPayment(2000000, 'Q3');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Q3 payment seems unreasonably high (> $1,000,000)');
    });

    it('should accept exactly $1,000,000', () => {
      const result = validateTaxPayment(1000000, 'Q4');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateIncome', () => {
    it('should accept reasonable income values', () => {
      const testCases = [-50000, 0, 50000, 500000, 10000000];
      testCases.forEach(income => {
        const result = validateIncome(income, 'Wages');
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject unreasonably large losses', () => {
      const result = validateIncome(-2000000, 'Capital Loss');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Capital Loss loss seems unreasonably large (< -$1,000,000)');
    });

    it('should reject unreasonably high income', () => {
      const result = validateIncome(200000000, 'Bonus');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Bonus seems unreasonably high (> $100,000,000)');
    });

    it('should accept exactly -$1,000,000', () => {
      const result = validateIncome(-1000000, 'Loss');
      expect(result.isValid).toBe(true);
    });

    it('should accept exactly $100,000,000', () => {
      const result = validateIncome(100000000, 'Income');
      expect(result.isValid).toBe(true);
    });
  });
});
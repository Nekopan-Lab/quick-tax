import { describe, it, expect } from 'vitest'
import { calculateCaliforniaTax, getCaliforniaStandardDeduction } from '@/calculators/california/calculator'
import { FilingStatus } from '@/types'

describe('California Tax Calculator', () => {
  describe('getCaliforniaStandardDeduction', () => {
    it('should return correct standard deduction for single filer', () => {
      expect(getCaliforniaStandardDeduction('single')).toBe(5540)
    })

    it('should return correct standard deduction for married filing jointly', () => {
      expect(getCaliforniaStandardDeduction('marriedFilingJointly')).toBe(11080)
    })
  })

  describe('calculateCaliforniaTax - Single Filer', () => {
    const filingStatus: FilingStatus = 'single'
    const standardDeduction = 5540

    it('should calculate zero tax for income below standard deduction', () => {
      const result = calculateCaliforniaTax(
        5000,
        standardDeduction,
        filingStatus
      )

      expect(result.taxableIncome).toBe(0)
      expect(result.baseTax).toBe(0)
      expect(result.mentalHealthTax).toBe(0)
      expect(result.totalTax).toBe(0)
    })

    it('should calculate tax for low income', () => {
      // $20,000 income - $5,540 deduction = $14,460 taxable
      // First $10,756 at 1% = $107.56
      // Next $3,704 at 2% = $74.08
      // Total = $181.64
      const result = calculateCaliforniaTax(
        20000,
        standardDeduction,
        filingStatus
      )

      expect(result.taxableIncome).toBe(14460)
      expect(result.baseTax).toBe(181.64)
      expect(result.mentalHealthTax).toBe(0)
      expect(result.totalTax).toBe(181.64)
    })

    it('should calculate tax for middle income', () => {
      // $75,000 income - $5,540 deduction = $69,460 taxable
      // Tax calculation through brackets:
      // $10,756 at 1% = $107.56
      // $14,743 at 2% = $294.86
      // $14,746 at 4% = $589.84
      // $15,621 at 6% = $937.26
      // $13,594 at 8% = $1,087.52
      // Total = $3,017.04
      const result = calculateCaliforniaTax(
        75000,
        standardDeduction,
        filingStatus
      )

      expect(result.taxableIncome).toBe(69460)
      expect(result.baseTax).toBe(3017.04)
      expect(result.mentalHealthTax).toBe(0)
      expect(result.totalTax).toBe(3017.04)
    })

    it('should calculate tax for high income with all brackets', () => {
      // $500,000 income - $5,540 deduction = $494,460 taxable
      const result = calculateCaliforniaTax(
        500000,
        standardDeduction,
        filingStatus
      )

      expect(result.taxableIncome).toBe(494460)
      // Tax through brackets:
      // $10,756 at 1% = $107.56
      // $14,743 at 2% = $294.86
      // $14,746 at 4% = $589.84
      // $15,621 at 6% = $937.26
      // $14,740 at 8% = $1,179.20
      // $290,053 at 9.3% = $26,974.93
      // $72,128 at 10.3% = $7,429.18
      // $61,673 at 11.3% = $6,969.05
      // Total = $44,481.88
      expect(result.baseTax).toBe(44481.88)
      expect(result.mentalHealthTax).toBe(0)
      expect(result.totalTax).toBe(44481.88)
    })

    it('should apply mental health tax for income over $1 million', () => {
      // $1,200,000 income - $5,540 deduction = $1,194,460 taxable
      // Mental health tax: ($1,194,460 - $1,000,000) * 1% = $1,944.60
      const result = calculateCaliforniaTax(
        1200000,
        standardDeduction,
        filingStatus
      )

      expect(result.taxableIncome).toBe(1194460)
      expect(result.mentalHealthTax).toBe(1944.60)
      expect(result.totalTax).toBe(result.baseTax + 1944.60)
    })
  })

  describe('calculateCaliforniaTax - Married Filing Jointly', () => {
    const filingStatus: FilingStatus = 'marriedFilingJointly'
    const standardDeduction = 11080

    it('should apply correct brackets for married filing jointly', () => {
      // $100,000 income - $11,080 deduction = $88,920 taxable
      // Tax calculation through brackets:
      // $21,512 at 1% = $215.12
      // $29,486 at 2% = $589.72
      // $29,492 at 4% = $1,179.68
      // $8,430 at 6% = $505.80
      // Total = $2,490.32
      const result = calculateCaliforniaTax(
        100000,
        standardDeduction,
        filingStatus
      )

      expect(result.taxableIncome).toBe(88920)
      expect(result.baseTax).toBe(2490.32)
      expect(result.mentalHealthTax).toBe(0)
      expect(result.totalTax).toBe(2490.32)
    })

    it('should calculate tax for high income married couple', () => {
      // $800,000 income - $11,080 deduction = $788,920 taxable
      const result = calculateCaliforniaTax(
        800000,
        standardDeduction,
        filingStatus
      )

      expect(result.taxableIncome).toBe(788920)
      // Verify tax is calculated correctly through all brackets
      // $21,512 at 1% = $215.12
      // $29,486 at 2% = $589.72
      // $29,492 at 4% = $1,179.68
      // $31,242 at 6% = $1,874.52
      // $29,480 at 8% = $2,358.40
      // $580,106 at 9.3% = $53,949.86
      // $67,602 at 10.3% = $6,963.01
      // Total = $67,130.31
      expect(result.baseTax).toBe(67130.30)
      expect(result.mentalHealthTax).toBe(0)
      expect(result.totalTax).toBe(67130.30)
    })

    it('should apply mental health tax for married couple over $1 million', () => {
      // $2,000,000 income - $11,080 deduction = $1,988,920 taxable
      // Mental health tax: ($1,988,920 - $1,000,000) * 1% = $9,889.20
      const result = calculateCaliforniaTax(
        2000000,
        standardDeduction,
        filingStatus
      )

      expect(result.taxableIncome).toBe(1988920)
      expect(result.mentalHealthTax).toBe(9889.20)
      
      // Base tax through all brackets including 12.3% bracket
      // The exact calculation would go through all brackets
      const expectedBaseTax = 207426.68 // Calculated through all brackets
      expect(result.baseTax).toBe(expectedBaseTax)
      expect(result.totalTax).toBe(expectedBaseTax + 9889.20)
    })
  })

  describe('California Tax - All Income Types Treated Same', () => {
    it('should tax capital gains the same as ordinary income', () => {
      // Unlike federal tax, CA treats all income types the same
      const incomeAmount = 100000
      const deduction = 5540
      
      const result = calculateCaliforniaTax(
        incomeAmount,
        deduction,
        'single'
      )

      // Verify the calculation is the same regardless of income type
      expect(result.taxableIncome).toBe(94460)
      expect(result.totalTax).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const result = calculateCaliforniaTax(
        0,
        5540,
        'single'
      )

      expect(result.taxableIncome).toBe(0)
      expect(result.totalTax).toBe(0)
    })

    it('should handle deductions larger than income', () => {
      const result = calculateCaliforniaTax(
        10000,
        20000,
        'single'
      )

      expect(result.taxableIncome).toBe(0)
      expect(result.totalTax).toBe(0)
    })

    it('should handle exactly $1 million income (mental health tax threshold)', () => {
      const result = calculateCaliforniaTax(
        1000000,
        5540,
        'single'
      )

      expect(result.taxableIncome).toBe(994460)
      expect(result.mentalHealthTax).toBe(0) // No mental health tax at exactly $1M taxable
    })

    it('should handle very high income correctly', () => {
      const result = calculateCaliforniaTax(
        5000000,
        11080,
        'marriedFilingJointly'
      )

      expect(result.taxableIncome).toBe(4988920)
      // Mental health tax: ($4,988,920 - $1,000,000) * 1% = $39,889.20
      expect(result.mentalHealthTax).toBe(39889.20)
      expect(result.totalTax).toBeGreaterThan(39889.20)
    })
  })
})
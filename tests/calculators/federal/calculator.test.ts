import { describe, it, expect } from 'vitest'
import { calculateFederalTax, getFederalStandardDeduction } from '@/calculators/federal/calculator'
import { FilingStatus, TaxYear } from '@/types'

describe('Federal Tax Calculator', () => {
  describe('getFederalStandardDeduction', () => {
    it('should return correct standard deduction for single filer in 2025', () => {
      expect(getFederalStandardDeduction(2025, 'single')).toBe(15000)
    })

    it('should return correct standard deduction for married filing jointly in 2025', () => {
      expect(getFederalStandardDeduction(2025, 'marriedFilingJointly')).toBe(30000)
    })

    it('should return correct standard deduction for single filer in 2026', () => {
      expect(getFederalStandardDeduction(2026, 'single')).toBe(15350)
    })

    it('should return correct standard deduction for married filing jointly in 2026', () => {
      expect(getFederalStandardDeduction(2026, 'marriedFilingJointly')).toBe(30700)
    })
  })

  describe('calculateFederalTax - Single Filer', () => {
    const filingStatus: FilingStatus = 'single'
    const taxYear: TaxYear = 2025
    const standardDeduction = 15000

    it('should calculate zero tax for income below standard deduction', () => {
      const result = calculateFederalTax(
        {
          ordinaryIncome: 10000,
          qualifiedDividends: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 0
        },
        standardDeduction,
        filingStatus,
        taxYear
      )

      expect(result.taxableIncome).toBe(0)
      expect(result.ordinaryIncomeTax).toBe(0)
      expect(result.capitalGainsTax).toBe(0)
      expect(result.totalTax).toBe(0)
    })

    it('should calculate tax for ordinary income only', () => {
      // $50,000 income - $15,000 deduction = $35,000 taxable
      // First $11,925 at 10% = $1,192.50
      // Next $23,075 at 12% = $2,769
      // Total = $3,961.50
      const result = calculateFederalTax(
        {
          ordinaryIncome: 50000,
          qualifiedDividends: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 0
        },
        standardDeduction,
        filingStatus,
        taxYear
      )

      expect(result.taxableIncome).toBe(35000)
      expect(result.ordinaryIncomeTax).toBe(3961.50)
      expect(result.capitalGainsTax).toBe(0)
      expect(result.totalTax).toBe(3961.50)
    })

    it('should tax short-term capital gains as ordinary income', () => {
      // $30,000 ordinary + $20,000 STCG = $50,000 total ordinary income
      const result = calculateFederalTax(
        {
          ordinaryIncome: 30000,
          qualifiedDividends: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 20000
        },
        standardDeduction,
        filingStatus,
        taxYear
      )

      expect(result.taxableIncome).toBe(35000)
      expect(result.ordinaryIncomeTax).toBe(3961.50)
      expect(result.capitalGainsTax).toBe(0)
      expect(result.totalTax).toBe(3961.50)
    })

    it('should apply 0% capital gains rate for low income', () => {
      // $20,000 ordinary income - $15,000 deduction = $5,000 taxable ordinary
      // $10,000 LTCG, total taxable = $15,000
      // Since total is under $48,350, LTCG rate is 0%
      const result = calculateFederalTax(
        {
          ordinaryIncome: 20000,
          qualifiedDividends: 0,
          longTermCapitalGains: 10000,
          shortTermCapitalGains: 0
        },
        standardDeduction,
        filingStatus,
        taxYear
      )

      expect(result.taxableIncome).toBe(15000)
      expect(result.ordinaryIncomeTax).toBe(500) // $5,000 at 10%
      expect(result.capitalGainsTax).toBe(0) // 0% rate applies
      expect(result.totalTax).toBe(500)
    })

    it('should apply 15% capital gains rate for middle income', () => {
      // $60,000 ordinary income - $15,000 deduction = $45,000 taxable ordinary
      // $20,000 LTCG, total taxable = $65,000
      // Ordinary tax: First $11,925 at 10% + $33,075 at 12% = $5,161.50
      // LTCG: $45,000 ordinary puts us near the 0% cap of $48,350
      // So first $3,350 of LTCG at 0%, remaining $16,650 at 15% = $2,497.50
      const result = calculateFederalTax(
        {
          ordinaryIncome: 60000,
          qualifiedDividends: 0,
          longTermCapitalGains: 20000,
          shortTermCapitalGains: 0
        },
        standardDeduction,
        filingStatus,
        taxYear
      )

      expect(result.taxableIncome).toBe(65000)
      expect(result.ordinaryIncomeTax).toBe(5161.50)
      expect(result.capitalGainsTax).toBe(2497.50)
      expect(result.totalTax).toBe(7659)
    })

    it('should treat qualified dividends like long-term capital gains', () => {
      const result = calculateFederalTax(
        {
          ordinaryIncome: 60000,
          qualifiedDividends: 10000,
          longTermCapitalGains: 10000,
          shortTermCapitalGains: 0
        },
        standardDeduction,
        filingStatus,
        taxYear
      )

      expect(result.taxableIncome).toBe(65000)
      expect(result.ordinaryIncomeTax).toBe(5161.50)
      expect(result.capitalGainsTax).toBe(2497.50)
      expect(result.totalTax).toBe(7659)
    })

    it('should apply 20% capital gains rate for high income', () => {
      // $550,000 ordinary income - $15,000 deduction = $535,000 taxable ordinary
      // This puts us over the $533,400 threshold for 20% LTCG rate
      // $50,000 LTCG all taxed at 20% = $10,000
      const result = calculateFederalTax(
        {
          ordinaryIncome: 550000,
          qualifiedDividends: 0,
          longTermCapitalGains: 50000,
          shortTermCapitalGains: 0
        },
        standardDeduction,
        filingStatus,
        taxYear
      )

      expect(result.taxableIncome).toBe(585000)
      // Verify capital gains tax is at 20%
      expect(result.capitalGainsTax).toBe(10000)
    })
  })

  describe('calculateFederalTax - Married Filing Jointly', () => {
    const filingStatus: FilingStatus = 'marriedFilingJointly'
    const taxYear: TaxYear = 2025
    const standardDeduction = 30000

    it('should apply correct brackets for married filing jointly', () => {
      // $100,000 income - $30,000 deduction = $70,000 taxable
      // First $23,850 at 10% = $2,385
      // Next $46,150 at 12% = $5,538
      // Total = $7,923
      const result = calculateFederalTax(
        {
          ordinaryIncome: 100000,
          qualifiedDividends: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 0
        },
        standardDeduction,
        filingStatus,
        taxYear
      )

      expect(result.taxableIncome).toBe(70000)
      expect(result.ordinaryIncomeTax).toBe(7923)
      expect(result.capitalGainsTax).toBe(0)
      expect(result.totalTax).toBe(7923)
    })

    it('should apply correct capital gains brackets for married filing jointly', () => {
      // $80,000 ordinary income - $30,000 deduction = $50,000 taxable ordinary
      // $30,000 LTCG, total taxable = $80,000
      // Since total is under $96,700, all LTCG at 0%
      const result = calculateFederalTax(
        {
          ordinaryIncome: 80000,
          qualifiedDividends: 0,
          longTermCapitalGains: 30000,
          shortTermCapitalGains: 0
        },
        standardDeduction,
        filingStatus,
        taxYear
      )

      expect(result.taxableIncome).toBe(80000)
      expect(result.capitalGainsTax).toBe(0) // All at 0% rate
    })

    it('should handle mixed income types correctly', () => {
      // Complex scenario with all income types
      const result = calculateFederalTax(
        {
          ordinaryIncome: 150000,
          qualifiedDividends: 20000,
          longTermCapitalGains: 30000,
          shortTermCapitalGains: 10000
        },
        standardDeduction,
        filingStatus,
        taxYear
      )

      const totalIncome = 210000
      expect(result.taxableIncome).toBe(totalIncome - standardDeduction)
      
      // Verify that short-term gains are taxed as ordinary income
      const ordinaryForTax = 150000 + 10000 // includes STCG
      const ordinaryTaxable = ordinaryForTax - standardDeduction // $130,000
      
      // Calculate expected ordinary tax on $130,000
      // First $23,850 at 10% = $2,385
      // Next $73,100 at 12% = $8,772
      // Next $33,050 at 22% = $7,271
      // Total = $18,428
      expect(result.ordinaryIncomeTax).toBe(18428)
      
      // LTCG + Qualified Dividends = $50,000
      // Starting point is $130,000 (ordinary taxable)
      // All $50,000 is in the 15% bracket (between $96,700 and $600,050)
      expect(result.capitalGainsTax).toBe(7500)
      
      expect(result.totalTax).toBe(25928)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const result = calculateFederalTax(
        {
          ordinaryIncome: 0,
          qualifiedDividends: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 0
        },
        15000,
        'single',
        2025
      )

      expect(result.taxableIncome).toBe(0)
      expect(result.totalTax).toBe(0)
    })

    it('should handle itemized deductions larger than income', () => {
      const result = calculateFederalTax(
        {
          ordinaryIncome: 20000,
          qualifiedDividends: 5000,
          longTermCapitalGains: 5000,
          shortTermCapitalGains: 0
        },
        50000, // Large itemized deductions
        'single',
        2025
      )

      expect(result.taxableIncome).toBe(0)
      expect(result.totalTax).toBe(0)
    })

    it('should handle very high income correctly', () => {
      const result = calculateFederalTax(
        {
          ordinaryIncome: 1000000,
          qualifiedDividends: 100000,
          longTermCapitalGains: 200000,
          shortTermCapitalGains: 50000
        },
        30000,
        'marriedFilingJointly',
        2025
      )

      expect(result.taxableIncome).toBe(1320000)
      expect(result.totalTax).toBeGreaterThan(0)
      
      // Verify 20% capital gains rate applies
      expect(result.capitalGainsTax).toBe(60000) // (100k + 200k) * 0.20
    })
  })
})
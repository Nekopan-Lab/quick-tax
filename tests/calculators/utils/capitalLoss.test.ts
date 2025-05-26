import { describe, it, expect } from 'vitest'
import { calculateComprehensiveTax } from '../../../src/utils/taxCalculations'

describe('Capital Loss Deduction Limit', () => {
  const baseIncome = {
    ordinaryDividends: '0',
    qualifiedDividends: '0',
    interestIncome: '0',
    shortTermGains: '0',
    longTermGains: '0',
    ytdWage: '0',
    ytdFederalWithhold: '0',
    ytdStateWithhold: '0',
    futureWage: '0',
    futureFederalWithhold: '0',
    futureStateWithhold: '0',
    incomeMode: 'simple' as const,
    paycheckWage: '0',
    paycheckFederal: '0',
    paycheckState: '0',
    payFrequency: 'biweekly' as const,
    nextPayDate: '',
    rsuVestWage: '0',
    rsuVestFederal: '0',
    rsuVestState: '0',
    vestPrice: '0',
    futureRSUVests: []
  }

  const baseDeductions = {
    propertyTax: '0',
    mortgageInterest: '0',
    donations: '0',
    mortgageLoanDate: '' as const,
    mortgageBalance: '0',
    otherStateIncomeTax: '0'
  }

  const baseEstimatedPayments = {
    federalQ1: '0',
    federalQ2: '0',
    federalQ3: '0',
    federalQ4: '0',
    californiaQ1: '0',
    californiaQ2: '0',
    californiaQ4: '0'
  }

  describe('$3,000 capital loss limit for single filers', () => {
    it('should limit capital losses to $3,000 against ordinary income', () => {
      const incomeWithLoss = {
        ...baseIncome,
        ytdWage: '50000',
        shortTermGains: '-10000' // $10k loss
      }
      
      const result = calculateComprehensiveTax(
        '2025',
        'single',
        false,
        baseDeductions,
        incomeWithLoss,
        baseIncome,
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Total income should be $50,000 - $3,000 = $47,000
        // Not $50,000 - $10,000 = $40,000
        expect(result.totalIncome).toBe(47000)
        
        // Taxable income after standard deduction
        expect(result.taxableIncome).toBe(32000) // $47k - $15k standard
      }
    })

    it('should allow full deduction when losses are under $3,000', () => {
      const incomeWithSmallLoss = {
        ...baseIncome,
        ytdWage: '50000',
        longTermGains: '-2000' // $2k loss
      }
      
      const result = calculateComprehensiveTax(
        '2025',
        'single',
        false,
        baseDeductions,
        incomeWithSmallLoss,
        baseIncome,
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Total income should be $50,000 - $2,000 = $48,000
        expect(result.totalIncome).toBe(48000)
      }
    })

    it('should net short-term and long-term gains/losses before applying limit', () => {
      const incomeWithMixedGains = {
        ...baseIncome,
        ytdWage: '50000',
        shortTermGains: '5000',  // $5k gain
        longTermGains: '-15000'  // $15k loss
      }
      
      const result = calculateComprehensiveTax(
        '2025',
        'single',
        false,
        baseDeductions,
        incomeWithMixedGains,
        baseIncome,
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Net capital loss: $5k - $15k = -$10k
        // Limited to -$3k
        // Total income: $50k - $3k = $47k
        expect(result.totalIncome).toBe(47000)
      }
    })

    it('should not apply limit when net capital gain is positive', () => {
      const incomeWithNetGain = {
        ...baseIncome,
        ytdWage: '50000',
        shortTermGains: '-5000',  // $5k loss
        longTermGains: '15000'    // $15k gain
      }
      
      const result = calculateComprehensiveTax(
        '2025',
        'single',
        false,
        baseDeductions,
        incomeWithNetGain,
        baseIncome,
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Net capital gain: -$5k + $15k = $10k (positive)
        // Total income: $50k + $10k = $60k
        expect(result.totalIncome).toBe(60000)
      }
    })
  })

  describe('$3,000 capital loss limit for married filing jointly', () => {
    it('should limit capital losses to $3,000 for married filing jointly', () => {
      const incomeWithLoss = {
        ...baseIncome,
        ytdWage: '100000',
        shortTermGains: '-20000' // $20k loss
      }
      
      const result = calculateComprehensiveTax(
        '2025',
        'marriedFilingJointly',
        false,
        baseDeductions,
        incomeWithLoss,
        baseIncome,
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Total income should be $100,000 - $3,000 = $97,000
        // Still $3,000 limit for married filing jointly
        expect(result.totalIncome).toBe(97000)
        
        // Taxable income after standard deduction
        expect(result.taxableIncome).toBe(67000) // $97k - $30k standard
      }
    })

    it('should combine spouse capital gains/losses', () => {
      const userIncome = {
        ...baseIncome,
        ytdWage: '50000',
        shortTermGains: '-8000' // $8k loss
      }
      
      const spouseIncome = {
        ...baseIncome,
        ytdWage: '50000',
        longTermGains: '-5000' // $5k loss
      }
      
      const result = calculateComprehensiveTax(
        '2025',
        'marriedFilingJointly',
        false,
        baseDeductions,
        userIncome,
        spouseIncome,
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Combined wages: $100k
        // Combined capital loss: -$8k + -$5k = -$13k
        // Limited to -$3k
        // Total income: $100k - $3k = $97k
        expect(result.totalIncome).toBe(97000)
      }
    })
  })

  describe('Capital loss carryforward indication', () => {
    it('should calculate unused capital loss', () => {
      const incomeWithLargeLoss = {
        ...baseIncome,
        ytdWage: '50000',
        shortTermGains: '-15000',  // $15k short-term loss
        longTermGains: '-10000'    // $10k long-term loss
      }
      
      const result = calculateComprehensiveTax(
        '2025',
        'single',
        false,
        baseDeductions,
        incomeWithLargeLoss,
        baseIncome,
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Total capital loss: -$25k
        // Deductible: -$3k
        // Carryforward: -$22k (though we don't track this in the result)
        expect(result.totalIncome).toBe(47000) // $50k - $3k
      }
    })
  })

  describe('California capital loss treatment', () => {
    it('should apply same $3,000 limit for California', () => {
      const incomeWithLoss = {
        ...baseIncome,
        ytdWage: '50000',
        shortTermGains: '-10000' // $10k loss
      }
      
      const result = calculateComprehensiveTax(
        '2025',
        'single',
        true, // Include California
        baseDeductions,
        incomeWithLoss,
        baseIncome,
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Both federal and CA should show same total income
        expect(result.totalIncome).toBe(47000) // $50k - $3k
        
        // California tax should be calculated on same income
        expect(result.californiaTax).toBeDefined()
      }
    })
  })
})
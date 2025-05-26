import { describe, it, expect } from 'vitest'
import { 
  calculateFederalItemizedDeductions,
  calculateCaliforniaItemizedDeductions 
} from '../../../src/utils/taxCalculations'

describe('Federal Itemized Deductions', () => {
  const baseDeductions = {
    propertyTax: '0',
    mortgageInterest: '0',
    donations: '0',
    mortgageLoanDate: '' as const,
    mortgageBalance: '0',
    otherStateIncomeTax: '0'
  }

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

  describe('SALT Cap', () => {
    it('should cap SALT deduction at $10,000', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '15000',
        otherStateIncomeTax: '8000'
      }
      
      const result = calculateFederalItemizedDeductions(
        deductions,
        baseIncome,
        baseIncome,
        'single',
        false,
        '2025'
      )
      
      // Property tax ($15k) + state income tax ($8k) = $23k, capped at $10k
      expect(result).toBe(10000)
    })

    it('should apply full SALT when under cap', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '5000',
        otherStateIncomeTax: '3000'
      }
      
      const result = calculateFederalItemizedDeductions(
        deductions,
        baseIncome,
        baseIncome,
        'single',
        false,
        '2025'
      )
      
      // Property tax ($5k) + state income tax ($3k) = $8k, under cap
      expect(result).toBe(8000)
    })

    it('should include estimated CA tax when California is selected', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '5000'
      }
      
      const income = {
        ...baseIncome,
        ytdWage: '100000'
      }
      
      const result = calculateFederalItemizedDeductions(
        deductions,
        income,
        baseIncome,
        'single',
        true, // California tax selected
        '2025'
      )
      
      // Result should include property tax + estimated CA tax, capped at $10k
      expect(result).toBeGreaterThan(5000)
      expect(result).toBeLessThanOrEqual(10000)
    })
  })

  describe('Mortgage Interest Limits', () => {
    it('should apply $750k limit for loans after Dec 15, 2017', () => {
      const deductions = {
        ...baseDeductions,
        mortgageInterest: '30000',
        mortgageBalance: '1000000',
        mortgageLoanDate: 'after-dec-15-2017' as const
      }
      
      const result = calculateFederalItemizedDeductions(
        deductions,
        baseIncome,
        baseIncome,
        'single',
        false,
        '2025'
      )
      
      // Interest should be prorated: $30k * ($750k / $1M) = $22.5k
      expect(result).toBe(22500)
    })

    it('should apply $1M limit for loans before Dec 16, 2017', () => {
      const deductions = {
        ...baseDeductions,
        mortgageInterest: '50000',
        mortgageBalance: '1200000',
        mortgageLoanDate: 'before-dec-16-2017' as const
      }
      
      const result = calculateFederalItemizedDeductions(
        deductions,
        baseIncome,
        baseIncome,
        'single',
        false,
        '2025'
      )
      
      // Interest should be prorated: $50k * ($1M / $1.2M) = $41,666.67
      expect(result).toBeCloseTo(41666.67, 2)
    })

    it('should apply full interest when under limit', () => {
      const deductions = {
        ...baseDeductions,
        mortgageInterest: '20000',
        mortgageBalance: '500000',
        mortgageLoanDate: 'after-dec-15-2017' as const
      }
      
      const result = calculateFederalItemizedDeductions(
        deductions,
        baseIncome,
        baseIncome,
        'single',
        false,
        '2025'
      )
      
      // Balance ($500k) is under limit ($750k), so full interest applies
      expect(result).toBe(20000)
    })
  })

  describe('Combined Deductions', () => {
    it('should correctly combine SALT cap, mortgage limit, and donations', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '12000',
        mortgageInterest: '40000',
        mortgageBalance: '900000',
        mortgageLoanDate: 'after-dec-15-2017' as const,
        donations: '5000'
      }
      
      const result = calculateFederalItemizedDeductions(
        deductions,
        baseIncome,
        baseIncome,
        'single',
        false,
        '2025'
      )
      
      // SALT: $12k capped at $10k
      // Mortgage: $40k * ($750k / $900k) = $33,333.33
      // Donations: $5k
      // Total: $10k + $33,333.33 + $5k = $48,333.33
      expect(result).toBeCloseTo(48333.33, 2)
    })
  })
})

describe('California Itemized Deductions', () => {
  const baseDeductions = {
    propertyTax: '0',
    mortgageInterest: '0',
    donations: '0',
    mortgageLoanDate: '' as const,
    mortgageBalance: '0',
    otherStateIncomeTax: '0'
  }

  it('should apply $1M mortgage limit regardless of loan date', () => {
    const deductions = {
      ...baseDeductions,
      mortgageInterest: '50000',
      mortgageBalance: '1500000',
      mortgageLoanDate: 'after-dec-15-2017' as const
    }
    
    const result = calculateCaliforniaItemizedDeductions(deductions)
    
    // Interest should be prorated: $50k * ($1M / $1.5M) = $33,333.33
    expect(result).toBeCloseTo(33333.33, 2)
  })

  it('should not include state income tax in CA deductions', () => {
    const deductions = {
      ...baseDeductions,
      propertyTax: '10000',
      otherStateIncomeTax: '5000' // This should not be included
    }
    
    const result = calculateCaliforniaItemizedDeductions(deductions)
    
    // Only property tax should be included, not state income tax
    expect(result).toBe(10000)
  })

  it('should correctly combine all CA deductions', () => {
    const deductions = {
      ...baseDeductions,
      propertyTax: '8000',
      mortgageInterest: '30000',
      mortgageBalance: '800000',
      donations: '3000'
    }
    
    const result = calculateCaliforniaItemizedDeductions(deductions)
    
    // Property tax: $8k
    // Mortgage interest: $30k (under $1M limit, so full amount)
    // Donations: $3k
    // Total: $8k + $30k + $3k = $41k
    expect(result).toBe(41000)
  })
})
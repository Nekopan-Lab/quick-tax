import { describe, it, expect } from 'vitest'
import { calculateFederalItemizedDeductions } from '../../../src/calculators/federal/calculator'
import { calculateCaliforniaItemizedDeductions } from '../../../src/calculators/california/calculator'
import { getFederalSaltCap } from '../../../src/calculators/federal/constants'

describe('Federal Itemized Deductions', () => {
  const baseDeductions = {
    propertyTax: '0',
    mortgageInterest: '0',
    donations: '0',
    mortgageLoanDate: '' as const,
    mortgageBalance: '0',
    otherStateIncomeTax: '0'
  }

  describe('SALT Cap - Tax Year 2025', () => {
    it('should cap SALT deduction at $10,000 for 2025', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '15000',
        otherStateIncomeTax: '8000'
      }

      const result = calculateFederalItemizedDeductions(
        deductions,
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2025, // taxYear
        100000 // MAGI
      )

      // Property tax ($15k) + state income tax ($8k) = $23k, capped at $10k for 2025
      expect(result).toBe(10000)
    })

    it('should apply full SALT when under cap for 2025', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '5000',
        otherStateIncomeTax: '3000'
      }

      const result = calculateFederalItemizedDeductions(
        deductions,
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2025, // taxYear
        100000 // MAGI
      )

      // Property tax ($5k) + state income tax ($3k) = $8k, under cap
      expect(result).toBe(8000)
    })

    it('should include estimated CA tax when California is selected for 2025', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '5000'
      }

      // Simulate estimated CA tax on $100k income
      const estimatedCAStateTax = 3000 // Approximate CA tax on $100k

      const result = calculateFederalItemizedDeductions(
        deductions,
        estimatedCAStateTax,
        true, // includeCaliforniaTax
        2025, // taxYear
        100000 // MAGI
      )

      // Result should include property tax + estimated CA tax, capped at $10k
      expect(result).toBeGreaterThan(5000)
      expect(result).toBeLessThanOrEqual(10000)
    })
  })

  describe('SALT Cap - Tax Year 2026', () => {
    it('should have $40,000 SALT cap for 2026 with income under phaseout threshold', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '25000',
        otherStateIncomeTax: '15000'
      }

      const result = calculateFederalItemizedDeductions(
        deductions,
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2026, // taxYear
        400000 // MAGI below $500k phaseout threshold
      )

      // Property tax ($25k) + state income tax ($15k) = $40k, exactly at cap for 2026
      expect(result).toBe(40000)
    })

    it('should allow full SALT deduction up to $40,000 for 2026', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '20000',
        otherStateIncomeTax: '10000'
      }

      const result = calculateFederalItemizedDeductions(
        deductions,
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2026, // taxYear
        300000 // MAGI below threshold
      )

      // Property tax ($20k) + state income tax ($10k) = $30k, under $40k cap
      expect(result).toBe(30000)
    })

    it('should apply phaseout for income above $500,000 in 2026', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '30000',
        otherStateIncomeTax: '20000'
      }

      // At $600k MAGI, the cap phases out by ($600k - $500k) * 0.30 = $30k
      // So cap = $40k - $30k = $10k (minimum)
      const result = calculateFederalItemizedDeductions(
        deductions,
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2026, // taxYear
        600000 // MAGI above $500k phaseout threshold
      )

      // SALT total is $50k, but cap is reduced to $10k (minimum)
      expect(result).toBe(10000)
    })

    it('should apply partial phaseout for income between $500k and $600k in 2026', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '30000',
        otherStateIncomeTax: '20000'
      }

      // At $550k MAGI, the cap phases out by ($550k - $500k) * 0.30 = $15k
      // So cap = $40k - $15k = $25k
      const result = calculateFederalItemizedDeductions(
        deductions,
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2026, // taxYear
        550000 // MAGI above threshold
      )

      // SALT total is $50k, but cap is reduced to $25k
      expect(result).toBe(25000)
    })

    it('should never reduce SALT cap below $10,000 regardless of income in 2026', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '30000',
        otherStateIncomeTax: '20000'
      }

      // At $1M MAGI, the cap phases out by ($1M - $500k) * 0.30 = $150k
      // But minimum cap is $10k
      const result = calculateFederalItemizedDeductions(
        deductions,
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2026, // taxYear
        1000000 // Very high MAGI
      )

      // SALT total is $50k, but cap floors at $10k
      expect(result).toBe(10000)
    })
  })

  describe('getFederalSaltCap helper function', () => {
    it('should return $10,000 for 2025 regardless of income', () => {
      expect(getFederalSaltCap(2025, 100000)).toBe(10000)
      expect(getFederalSaltCap(2025, 500000)).toBe(10000)
      expect(getFederalSaltCap(2025, 1000000)).toBe(10000)
    })

    it('should return $40,000 for 2026 when income is at or below $500,000', () => {
      expect(getFederalSaltCap(2026, 100000)).toBe(40000)
      expect(getFederalSaltCap(2026, 400000)).toBe(40000)
      expect(getFederalSaltCap(2026, 500000)).toBe(40000)
    })

    it('should phase out for 2026 when income is above $500,000', () => {
      // At $550k: $40k - ($50k * 0.30) = $40k - $15k = $25k
      expect(getFederalSaltCap(2026, 550000)).toBe(25000)
      // At $600k: $40k - ($100k * 0.30) = $40k - $30k = $10k (minimum)
      expect(getFederalSaltCap(2026, 600000)).toBe(10000)
    })

    it('should never return less than $10,000 for 2026', () => {
      expect(getFederalSaltCap(2026, 700000)).toBe(10000)
      expect(getFederalSaltCap(2026, 1000000)).toBe(10000)
      expect(getFederalSaltCap(2026, 5000000)).toBe(10000)
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
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2025, // taxYear
        100000 // MAGI
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
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2025, // taxYear
        100000 // MAGI
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
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2025, // taxYear
        100000 // MAGI
      )

      // Balance ($500k) is under limit ($750k), so full interest applies
      expect(result).toBe(20000)
    })
  })

  describe('Combined Deductions', () => {
    it('should correctly combine SALT cap, mortgage limit, and donations for 2025', () => {
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
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2025, // taxYear
        100000 // MAGI
      )

      // SALT: $12k capped at $10k
      // Mortgage: $40k * ($750k / $900k) = $33,333.33
      // Donations: $5k
      // Total: $10k + $33,333.33 + $5k = $48,333.33
      expect(result).toBeCloseTo(48333.33, 2)
    })

    it('should correctly combine higher SALT cap with other deductions for 2026', () => {
      const deductions = {
        ...baseDeductions,
        propertyTax: '25000',
        otherStateIncomeTax: '10000',
        mortgageInterest: '40000',
        mortgageBalance: '900000',
        mortgageLoanDate: 'after-dec-15-2017' as const,
        donations: '5000'
      }

      const result = calculateFederalItemizedDeductions(
        deductions,
        0, // estimatedCAStateTax
        false, // includeCaliforniaTax
        2026, // taxYear
        400000 // MAGI below phaseout threshold
      )

      // SALT: $25k + $10k = $35k (under $40k cap for 2026)
      // Mortgage: $40k * ($750k / $900k) = $33,333.33
      // Donations: $5k
      // Total: $35k + $33,333.33 + $5k = $73,333.33
      expect(result).toBeCloseTo(73333.33, 2)
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
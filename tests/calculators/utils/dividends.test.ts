import { describe, it, expect } from 'vitest'
import { calculateComprehensiveTax } from '../../../src/calculators/orchestrator'

describe('Dividend Tax Calculations', () => {
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

  describe('Qualified dividends should reduce tax burden', () => {
    it('should tax ordinary dividends at ordinary income rates', () => {
      const incomeWithOrdinaryDividends = {
        ...baseIncome,
        ordinaryDividends: '133552'
      }
      
      const result = calculateComprehensiveTax(
        2025,
        'single',
        true,
        baseDeductions,
        incomeWithOrdinaryDividends,
        baseIncome, // spouse income
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Store these values for comparison
        const ordinaryOnlyFederal = result.federalTax.totalTax
        const ordinaryOnlyCalifornia = result.californiaTax?.totalTax || 0
        
        // Federal tax should be around 22% marginal rate on dividends above standard deduction
        // $133,552 - $15,000 standard = $118,552 taxable
        expect(ordinaryOnlyFederal).toBeGreaterThan(0)
        expect(ordinaryOnlyCalifornia).toBeGreaterThan(0)
      }
    })

    it('should tax qualified dividends at preferential rates', () => {
      const incomeWithQualifiedDividends = {
        ...baseIncome,
        ordinaryDividends: '133552',
        qualifiedDividends: '54861' // subset of ordinary
      }
      
      const result = calculateComprehensiveTax(
        2025,
        'single',
        true,
        baseDeductions,
        incomeWithQualifiedDividends,
        baseIncome, // spouse income
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // With qualified dividends, federal tax should be lower
        // Qualified dividends get 0% or 15% rate instead of ordinary income rates
        const withQualifiedFederal = result.federalTax.totalTax
        const withQualifiedCalifornia = result.californiaTax?.totalTax || 0
        
        // Compare with ordinary-only scenario
        const ordinaryOnlyResult = calculateComprehensiveTax(
          2025,
          'single',
          true,
          baseDeductions,
          { ...baseIncome, ordinaryDividends: '133552' },
          baseIncome,
          baseEstimatedPayments
        )
        
        if (ordinaryOnlyResult) {
          // Federal tax should be lower with qualified dividends
          expect(withQualifiedFederal).toBeLessThan(ordinaryOnlyResult.federalTax.totalTax)
          
          // California tax should be the same (CA doesn't give preferential treatment)
          expect(withQualifiedCalifornia).toBeCloseTo(ordinaryOnlyResult.californiaTax?.totalTax || 0, 2)
        }
      }
    })

    it('should not double-count qualified dividends', () => {
      const income = {
        ...baseIncome,
        ordinaryDividends: '100000',
        qualifiedDividends: '100000' // all dividends are qualified
      }
      
      const result = calculateComprehensiveTax(
        2025,
        'single',
        false, // no CA tax for simpler comparison
        baseDeductions,
        income,
        baseIncome,
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Total income should be $100k, not $200k
        expect(result.totalIncome).toBe(100000)
        
        // Taxable income after standard deduction
        expect(result.federalTax.taxableIncome).toBe(85000) // $100k - $15k standard deduction
      }
    })

    it('should handle qualified dividends exceeding ordinary dividends', () => {
      const income = {
        ...baseIncome,
        ordinaryDividends: '50000',
        qualifiedDividends: '70000' // more than ordinary (user error)
      }
      
      const result = calculateComprehensiveTax(
        2025,
        'single',
        false,
        baseDeductions,
        income,
        baseIncome,
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Should cap qualified at ordinary amount
        expect(result.totalIncome).toBe(50000)
      }
    })
  })

  describe('Real scenario from user', () => {
    it('should calculate correct tax for $133,552 ordinary with $54,861 qualified', () => {
      const income = {
        ...baseIncome,
        ordinaryDividends: '133552',
        qualifiedDividends: '54861'
      }
      
      const result = calculateComprehensiveTax(
        2025,
        'single',
        true,
        baseDeductions,
        income,
        baseIncome,
        baseEstimatedPayments
      )
      
      expect(result).not.toBeNull()
      if (result) {
        // Total income should still be $133,552
        expect(result.totalIncome).toBe(133552)
        
        // Federal tax calculation:
        // - Standard deduction: $15,000
        // - Taxable income: $118,552
        // - Non-qualified dividends: $133,552 - $54,861 = $78,691
        // - Qualified dividends: $54,861
        
        // Ordinary income portion: $78,691 - gets taxed at regular rates
        // Qualified dividend portion: $54,861 - gets taxed at capital gains rates
        
        // The federal tax should be less than if all dividends were ordinary
        const allOrdinaryResult = calculateComprehensiveTax(
          '2025',
          'single',
          true,
          baseDeductions,
          { ...baseIncome, ordinaryDividends: '133552', qualifiedDividends: '0' },
          baseIncome,
          baseEstimatedPayments
        )
        
        if (allOrdinaryResult) {
          expect(result.federalTax.totalTax).toBeLessThan(allOrdinaryResult.federalTax.totalTax)
        }
      }
    })
  })
})
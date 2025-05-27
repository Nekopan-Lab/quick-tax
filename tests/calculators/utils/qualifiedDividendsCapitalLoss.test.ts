import { describe, it, expect } from 'vitest'
import { calculateComprehensiveTax } from '../../../src/utils/taxCalculations'
import type { FilingStatus } from '../../../src/types'

describe('Qualified Dividends and Capital Loss Interaction', () => {
  const baseUserIncome = {
    ordinaryDividends: '',
    qualifiedDividends: '',
    interestIncome: '',
    shortTermGains: '',
    longTermGains: '',
    ytdWage: '',
    ytdFederalWithhold: '',
    ytdStateWithhold: '',
    futureWage: '',
    futureFederalWithhold: '',
    futureStateWithhold: '',
    incomeMode: 'simple' as const,
    paycheckWage: '',
    paycheckFederal: '',
    paycheckState: '',
    payFrequency: 'biweekly' as const,
    nextPayDate: '',
    rsuVestWage: '',
    rsuVestFederal: '',
    rsuVestState: '',
    vestPrice: '',
    futureRSUVests: []
  }

  const baseDeductions = {
    propertyTax: '',
    mortgageInterest: '',
    donations: '',
    mortgageLoanDate: '' as const,
    mortgageBalance: '',
    otherStateIncomeTax: ''
  }

  const baseEstimatedPayments = {
    federalQ1: '',
    federalQ2: '',
    federalQ3: '',
    federalQ4: '',
    californiaQ1: '',
    californiaQ2: '',
    californiaQ4: ''
  }

  it('should not reduce qualified dividends amount when capital losses exist', () => {
    const userIncome = {
      ...baseUserIncome,
      ordinaryDividends: '10000',
      qualifiedDividends: '8000', // subset of ordinary dividends
      interestIncome: '2000',
      shortTermGains: '0',
      longTermGains: '-5000' // capital loss
    }

    const result = calculateComprehensiveTax(
      '2025',
      'single' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      baseUserIncome, // spouse income
      baseEstimatedPayments
    )
    
    // Verify that qualified dividends remain at their full amount for preferential tax treatment
    expect(result._federalIncomeBreakdown.qualifiedDividends).toBe(8000)
    
    // Verify that the capital loss offsets ordinary income (up to $3,000)
    const expectedOrdinaryIncome = 
      2000 + // non-qualified dividends (10000 - 8000)
      2000 + // interest income
      -3000  // capital loss limit applied to ordinary income
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(expectedOrdinaryIncome)
  })

  it('should apply capital loss to ordinary income even with qualified dividends present', () => {
    const userIncome = {
      ...baseUserIncome,
      ordinaryDividends: '50000',
      qualifiedDividends: '40000', // subset of ordinary dividends
      interestIncome: '5000',
      shortTermGains: '-2000',
      longTermGains: '-8000', // total capital loss of -10000
      ytdWage: '100000',
      ytdFederalWithhold: '20000',
      ytdStateWithhold: '5000'
    }

    const result = calculateComprehensiveTax(
      '2025',
      'single' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Qualified dividends should remain unchanged
    expect(result._federalIncomeBreakdown.qualifiedDividends).toBe(40000)
    
    // Ordinary income should include the $3,000 capital loss deduction
    const expectedOrdinaryIncome = 
      100000 + // wages
      10000 +  // non-qualified dividends (50000 - 40000)
      5000 +   // interest income
      -3000    // capital loss limit
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(expectedOrdinaryIncome)
  })

  it('should correctly calculate tax with qualified dividends getting preferential rates', () => {
    const userIncome = {
      ...baseUserIncome,
      ordinaryDividends: '20000',
      qualifiedDividends: '20000', // all dividends are qualified
      interestIncome: '0',
      shortTermGains: '0',
      longTermGains: '-15000', // capital loss exceeding $3,000 limit
      ytdWage: '50000',
      ytdFederalWithhold: '8000',
      ytdStateWithhold: '2000'
    }

    const result = calculateComprehensiveTax(
      '2025',
      'single' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Verify income breakdown
    expect(result._federalIncomeBreakdown.qualifiedDividends).toBe(20000)
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(50000 - 3000) // wages minus capital loss limit
    expect(result._federalIncomeBreakdown.longTermCapitalGains).toBe(0) // no positive LTCG
    
    // Verify that qualified dividends get preferential tax treatment
    // With $47,000 ordinary income and $20,000 qualified dividends, after standard deduction of $15,000:
    // Ordinary taxable income: $47,000 - $15,000 = $32,000
    // This puts total taxable income at $52,000, so qualified dividends are taxed at 15% rate
    expect(result.federalTax.capitalGainsTax).toBeGreaterThan(0)
    expect(result.federalTax.capitalGainsTax).toBeLessThan(result.federalTax.ordinaryIncomeTax)
  })

  it('should handle married filing jointly with capital losses and qualified dividends', () => {
    const userIncome = {
      ...baseUserIncome,
      ordinaryDividends: '30000',
      qualifiedDividends: '25000',
      interestIncome: '3000',
      shortTermGains: '-5000',
      longTermGains: '-2000'
    }

    const spouseIncome = {
      ...baseUserIncome,
      ordinaryDividends: '15000',
      qualifiedDividends: '15000',
      interestIncome: '2000',
      shortTermGains: '0',
      longTermGains: '-1000',
      ytdWage: '80000',
      ytdFederalWithhold: '15000',
      ytdStateWithhold: '4000'
    }

    const result = calculateComprehensiveTax(
      '2025',
      'marriedFilingJointly' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      spouseIncome,
      baseEstimatedPayments
    )
    
    // Total qualified dividends from both spouses
    expect(result._federalIncomeBreakdown.qualifiedDividends).toBe(40000)
    
    // Total capital loss is -8000, limited to -3000 for ordinary income offset
    const expectedOrdinaryIncome = 
      80000 +  // spouse wages
      5000 +   // user non-qualified dividends (30000 - 25000)
      0 +      // spouse non-qualified dividends (15000 - 15000)
      5000 +   // total interest income
      -3000    // capital loss limit
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(expectedOrdinaryIncome)
  })

  it('should show that capital losses do not directly reduce qualified dividend amounts', () => {
    // This test verifies the IRS rule that capital losses don't reduce the amount
    // of qualified dividends eligible for preferential tax rates
    const userIncome = {
      ...baseUserIncome,
      ordinaryDividends: '30000',
      qualifiedDividends: '30000', // all dividends are qualified
      longTermGains: '-10000' // large capital loss
    }

    const result = calculateComprehensiveTax(
      '2025',
      'single' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Qualified dividends should remain at $30,000 for preferential rate calculation
    // even though we have $10,000 in capital losses
    expect(result._federalIncomeBreakdown.qualifiedDividends).toBe(30000)
    
    // The $3,000 capital loss limit applies to ordinary income
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(-3000)
    
    // No long-term capital gains should be reported (losses don't get preferential rates)
    expect(result._federalIncomeBreakdown.longTermCapitalGains).toBe(0)
  })
})
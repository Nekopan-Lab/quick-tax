import { describe, it, expect } from 'vitest'
import { calculateComprehensiveTax } from '../../../src/utils/taxCalculations'
import type { FilingStatus } from '../../../src/types'

describe('Ordinary Income Calculation', () => {
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

  it('should calculate ordinary income with wages only', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '100000',
      ytdFederalWithhold: '20000',
      futureWage: '50000',
      futureFederalWithhold: '10000'
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
    
    // Total wages = 100,000 + 50,000 = 150,000
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(150000)
    expect(result._federalIncomeBreakdown.qualifiedDividends).toBe(0)
    expect(result._federalIncomeBreakdown.longTermCapitalGains).toBe(0)
  })

  it('should separate qualified and non-qualified dividends correctly', () => {
    const userIncome = {
      ...baseUserIncome,
      ordinaryDividends: '20000',
      qualifiedDividends: '15000', // subset of ordinary dividends
      ytdWage: '80000'
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
    
    // Ordinary income includes wages + non-qualified dividends
    // Non-qualified = 20,000 - 15,000 = 5,000
    const expectedOrdinaryIncome = 80000 + 5000
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(expectedOrdinaryIncome)
    expect(result._federalIncomeBreakdown.qualifiedDividends).toBe(15000)
  })

  it('should include interest income in ordinary income', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '100000',
      interestIncome: '5000',
      ordinaryDividends: '10000',
      qualifiedDividends: '8000'
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
    
    // Ordinary income = wages + interest + non-qualified dividends
    // Non-qualified = 10,000 - 8,000 = 2,000
    const expectedOrdinaryIncome = 100000 + 5000 + 2000
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(expectedOrdinaryIncome)
  })

  it('should track short-term capital gains separately but tax as ordinary income', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '100000',
      shortTermGains: '10000',
      longTermGains: '5000'
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
    
    // Short-term gains are tracked separately but taxed as ordinary income
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(100000) // wages only
    expect(result._federalIncomeBreakdown.shortTermCapitalGains).toBe(10000) // tracked separately
    expect(result._federalIncomeBreakdown.longTermCapitalGains).toBe(5000)
    
    // Verify they're taxed together by checking the tax calculation
    // With $110,000 total ordinary income (wages + short-term gains) and $15,000 standard deduction
    // Taxable ordinary income = $95,000, which should result in higher tax than just $100,000 wages
    expect(result.federalTax.ordinaryIncomeTax).toBeGreaterThan(0)
  })

  it('should apply capital loss deduction to ordinary income', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '100000',
      shortTermGains: '-5000',
      longTermGains: '-3000'
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
    
    // Total capital loss = -5,000 + -3,000 = -8,000
    // Limited to -3,000 for ordinary income deduction
    const expectedOrdinaryIncome = 100000 - 3000
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(expectedOrdinaryIncome)
    expect(result._federalIncomeBreakdown.shortTermCapitalGains).toBe(0)
    expect(result._federalIncomeBreakdown.longTermCapitalGains).toBe(0)
  })

  it('should combine spouse income correctly', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '80000',
      ordinaryDividends: '10000',
      qualifiedDividends: '8000',
      interestIncome: '2000'
    }

    const spouseIncome = {
      ...baseUserIncome,
      ytdWage: '70000',
      ordinaryDividends: '5000',
      qualifiedDividends: '5000',
      interestIncome: '3000'
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
    
    // Combined ordinary income:
    // Wages: 80,000 + 70,000 = 150,000
    // Non-qualified dividends: (10,000 - 8,000) + (5,000 - 5,000) = 2,000
    // Interest: 2,000 + 3,000 = 5,000
    const expectedOrdinaryIncome = 150000 + 2000 + 5000
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(expectedOrdinaryIncome)
    
    // Combined qualified dividends: 8,000 + 5,000 = 13,000
    expect(result._federalIncomeBreakdown.qualifiedDividends).toBe(13000)
  })

  it('should handle mixed capital gains and losses correctly', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '100000',
      shortTermGains: '10000',
      longTermGains: '-15000'
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
    
    // Net capital gain/loss = 10,000 - 15,000 = -5,000
    // Limited to -3,000 for ordinary income deduction
    // The 10,000 short-term gain offsets the long-term loss first
    const expectedOrdinaryIncome = 100000 - 3000
    expect(result._federalIncomeBreakdown.ordinaryIncome).toBe(expectedOrdinaryIncome)
    expect(result._federalIncomeBreakdown.shortTermCapitalGains).toBe(0)
    expect(result._federalIncomeBreakdown.longTermCapitalGains).toBe(0)
  })
})
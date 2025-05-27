import { describe, it, expect } from 'vitest'
import { calculateComprehensiveTax } from '../../../src/calculators/orchestrator'
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
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Total wages = 100,000 + 50,000 = 150,000
    expect(result).not.toBeNull()
    expect(result!.totalIncome).toBe(150000)
    // With standard deduction of $15,000, taxable income = $135,000
    expect(result!.federalTax.taxableIncome).toBe(135000)
    // The tax should be calculated on ordinary income rates only
    expect(result!.federalTax.totalTax).toBeGreaterThan(0)
  })

  it('should separate qualified and non-qualified dividends correctly', () => {
    const userIncome = {
      ...baseUserIncome,
      ordinaryDividends: '20000',
      qualifiedDividends: '15000', // subset of ordinary dividends
      ytdWage: '80000'
    }

    const result = calculateComprehensiveTax(
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Total income = wages + all dividends = 80,000 + 20,000 = 100,000
    expect(result).not.toBeNull()
    expect(result!.totalIncome).toBe(100000)
    
    // To verify qualified dividends get preferential treatment:
    // Calculate what tax would be with no qualified dividends
    const resultNoQualified = calculateComprehensiveTax(
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      { ...userIncome, qualifiedDividends: '0' },
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Tax should be lower with qualified dividends due to preferential rates
    expect(result!.federalTax.totalTax).toBeLessThan(resultNoQualified!.federalTax.totalTax)
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
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Total income should include all income sources
    // Wages: 100,000, Interest: 5,000, Dividends: 10,000 = 115,000
    expect(result).not.toBeNull()
    expect(result!.totalIncome).toBe(115000)
    
    // Verify interest is taxed at ordinary rates by comparing with no interest
    const resultNoInterest = calculateComprehensiveTax(
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      { ...userIncome, interestIncome: '0' },
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // The tax difference should reflect ordinary income rates on $5,000
    const taxDifference = result!.federalTax.totalTax - resultNoInterest!.federalTax.totalTax
    expect(taxDifference).toBeGreaterThan(0)
  })

  it('should track short-term capital gains separately but tax as ordinary income', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '100000',
      shortTermGains: '10000',
      longTermGains: '5000'
    }

    const result = calculateComprehensiveTax(
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Total income = wages + short-term + long-term = 100,000 + 10,000 + 5,000 = 115,000
    expect(result).not.toBeNull()
    expect(result!.totalIncome).toBe(115000)
    
    // Verify short-term gains are taxed as ordinary income by comparing
    // with scenario where they're long-term gains
    const resultAllLongTerm = calculateComprehensiveTax(
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      { ...userIncome, shortTermGains: '0', longTermGains: '15000' },
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Tax should be higher when gains are short-term (ordinary rates)
    expect(result!.federalTax.totalTax).toBeGreaterThan(resultAllLongTerm!.federalTax.totalTax)
  })

  it('should apply capital loss deduction to ordinary income', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '100000',
      shortTermGains: '-5000',
      longTermGains: '-3000'
    }

    const result = calculateComprehensiveTax(
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Total capital loss = -5,000 + -3,000 = -8,000
    // Limited to -3,000 for ordinary income deduction
    // Total income = 100,000 - 3,000 = 97,000
    expect(result).not.toBeNull()
    expect(result!.totalIncome).toBe(97000)
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
      2025,
      'marriedFilingJointly' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      spouseIncome,
      baseEstimatedPayments
    )
    
    // Combined total income:
    // Wages: 80,000 + 70,000 = 150,000
    // Dividends: 10,000 + 5,000 = 15,000
    // Interest: 2,000 + 3,000 = 5,000
    // Total: 170,000
    expect(result).not.toBeNull()
    expect(result!.totalIncome).toBe(170000)
    
    // With married filing jointly standard deduction of $30,000
    expect(result!.federalTax.taxableIncome).toBe(140000)
  })

  it('should handle mixed capital gains and losses correctly', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '100000',
      shortTermGains: '10000',
      longTermGains: '-15000'
    }

    const result = calculateComprehensiveTax(
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      userIncome,
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Net capital gain/loss = 10,000 - 15,000 = -5,000
    // Limited to -3,000 for ordinary income deduction
    // Total income = 100,000 - 3,000 = 97,000
    expect(result).not.toBeNull()
    expect(result!.totalIncome).toBe(97000)
  })
})
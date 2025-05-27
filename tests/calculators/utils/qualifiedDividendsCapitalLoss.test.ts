import { describe, it, expect } from 'vitest'
import { calculateComprehensiveTax } from '../../../src/calculators/orchestrator'
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
      ytdWage: '50000',
      ordinaryDividends: '10000',
      qualifiedDividends: '8000',
      longTermGains: '-5000' // Capital loss
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
    
    expect(result).not.toBeNull()
    
    // Total income = 50,000 + 10,000 - 3,000 (capital loss limit) = 57,000
    expect(result!.totalIncome).toBe(57000)
    
    // Verify that qualified dividends still get preferential treatment
    // by comparing with scenario where all dividends are non-qualified
    const resultNoQualified = calculateComprehensiveTax(
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      { ...userIncome, qualifiedDividends: '0' },
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Tax should be lower with qualified dividends even with capital losses
    expect(result!.federalTax.totalTax).toBeLessThan(resultNoQualified!.federalTax.totalTax)
  })

  it('should apply capital loss to ordinary income even with qualified dividends present', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '60000',
      ordinaryDividends: '5000',
      qualifiedDividends: '4000',
      shortTermGains: '-10000' // Large capital loss
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
    
    expect(result).not.toBeNull()
    
    // Total income = 60,000 + 5,000 - 3,000 (capital loss limit) = 62,000
    expect(result!.totalIncome).toBe(62000)
    
    // Verify the capital loss reduced total income
    const resultNoLoss = calculateComprehensiveTax(
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      { ...userIncome, shortTermGains: '0' },
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Total income without loss would be 65,000
    expect(resultNoLoss!.totalIncome).toBe(65000)
    expect(result!.totalIncome).toBe(resultNoLoss!.totalIncome - 3000)
  })

  it('should correctly calculate tax with qualified dividends getting preferential rates', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '50000',
      ordinaryDividends: '20000',
      qualifiedDividends: '20000', // All dividends are qualified
      shortTermGains: '-5000' // Some capital loss
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
    
    expect(result).not.toBeNull()
    
    // Total income = 50,000 + 20,000 - 3,000 = 67,000
    expect(result!.totalIncome).toBe(67000)
    
    // With standard deduction of 15,000, taxable income = 52,000
    expect(result!.federalTax.taxableIncome).toBe(52000)
    
    // Verify preferential rates by comparing with all ordinary income
    const resultAllOrdinary = calculateComprehensiveTax(
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      { ...userIncome, qualifiedDividends: '0' },
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // Tax should be significantly lower with qualified dividends
    const taxSavings = resultAllOrdinary!.federalTax.totalTax - result!.federalTax.totalTax
    expect(taxSavings).toBeGreaterThan(1000) // Substantial savings from preferential rates
  })

  it('should handle married filing jointly with capital losses and qualified dividends', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '80000',
      ordinaryDividends: '15000',
      qualifiedDividends: '10000',
      longTermGains: '-3000'
    }
    
    const spouseIncome = {
      ...baseUserIncome,
      ytdWage: '70000',
      ordinaryDividends: '10000',
      qualifiedDividends: '10000',
      shortTermGains: '-5000'
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
    
    expect(result).not.toBeNull()
    
    // Combined income:
    // Wages: 80,000 + 70,000 = 150,000
    // Dividends: 15,000 + 10,000 = 25,000
    // Capital losses: -3,000 + -5,000 = -8,000, limited to -3,000
    // Total: 150,000 + 25,000 - 3,000 = 172,000
    expect(result!.totalIncome).toBe(172000)
    
    // Total qualified dividends from both spouses: 10,000 + 10,000 = 20,000
    // These should still get preferential treatment
    const resultNoQualified = calculateComprehensiveTax(
      2025,
      'marriedFilingJointly' as FilingStatus,
      false,
      baseDeductions,
      { ...userIncome, qualifiedDividends: '0' },
      { ...spouseIncome, qualifiedDividends: '0' },
      baseEstimatedPayments
    )
    
    // Tax should be lower with qualified dividends
    expect(result!.federalTax.totalTax).toBeLessThan(resultNoQualified!.federalTax.totalTax)
  })

  it('should show that capital losses do not directly reduce qualified dividend amounts', () => {
    const userIncome = {
      ...baseUserIncome,
      ytdWage: '100000',
      ordinaryDividends: '30000',
      qualifiedDividends: '30000', // All dividends are qualified
      longTermGains: '-10000' // Capital loss
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
    
    expect(result).not.toBeNull()
    
    // Total income = 100,000 + 30,000 - 3,000 = 127,000
    expect(result!.totalIncome).toBe(127000)
    
    // The $30,000 of qualified dividends should still receive preferential treatment
    // even though there's a $10,000 capital loss
    // Test this by comparing with a scenario with no qualified dividends
    const resultNoQualified = calculateComprehensiveTax(
      2025,
      'single' as FilingStatus,
      false,
      baseDeductions,
      { ...userIncome, qualifiedDividends: '0' },
      baseUserIncome,
      baseEstimatedPayments
    )
    
    // The tax benefit from qualified dividends should be substantial
    const taxBenefit = resultNoQualified!.federalTax.totalTax - result!.federalTax.totalTax
    expect(taxBenefit).toBeGreaterThan(2000) // Significant benefit from $30k qualified dividends
  })
})
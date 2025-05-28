import { describe, it, expect } from 'vitest'
import { aggregateHouseholdIncome } from '../../../src/calculators/utils/householdIncome'
import type { IncomeData } from '../../../src/calculators/california/calculator'

describe('aggregateHouseholdIncome', () => {
  const createMockIncome = (overrides: Partial<IncomeData> = {}): IncomeData => ({
    ordinaryDividends: '1000',
    qualifiedDividends: '800',
    interestIncome: '500',
    shortTermGains: '2000',
    longTermGains: '3000',
    ytdWage: '50000',
    ytdFederalWithhold: '10000',
    ytdStateWithhold: '5000',
    incomeMode: 'simple',
    futureWage: '30000',
    futureFederalWithhold: '6000',
    futureStateWithhold: '3000',
    // Detailed mode fields
    paycheckWage: '',
    paycheckFederal: '',
    paycheckState: '',
    payFrequency: 'biweekly',
    nextPayDate: '',
    rsuVestWage: '',
    rsuVestFederal: '',
    rsuVestState: '',
    vestPrice: '',
    futureRSUVests: [],
    ...overrides
  })

  describe('Single filing status', () => {
    it('should only aggregate user income when filing single', () => {
      const userIncome = createMockIncome()
      const spouseIncome = createMockIncome({
        ordinaryDividends: '5000',
        ytdWage: '100000',
        ytdFederalWithhold: '20000'
      })

      const result = aggregateHouseholdIncome(userIncome, spouseIncome, 'single')

      // Should only include user income
      expect(result.totalIncome).toBe(86500) // 50000 + 30000 + 1000 + 500 + 2000 + 3000
      expect(result.investmentIncome.ordinaryDividends).toBe(1000)
      expect(result.wageIncome).toBe(80000) // 50000 + 30000
      expect(result.totalWithholdings.federal).toBe(16000) // 10000 + 6000
      expect(result.totalWithholdings.state).toBe(8000) // 5000 + 3000
    })

    it('should handle zero spouse income gracefully when single', () => {
      const userIncome = createMockIncome()
      const spouseIncome = createMockIncome({
        ordinaryDividends: '',
        ytdWage: '',
        ytdFederalWithhold: '',
        futureWage: ''
      })

      const result = aggregateHouseholdIncome(userIncome, spouseIncome, 'single')

      expect(result.totalIncome).toBe(86500)
      expect(result.wageIncome).toBe(80000)
    })
  })

  describe('Married filing jointly', () => {
    it('should aggregate both user and spouse income when married filing jointly', () => {
      const userIncome = createMockIncome()
      const spouseIncome = createMockIncome({
        ordinaryDividends: '2000',
        qualifiedDividends: '1500',
        interestIncome: '1000',
        shortTermGains: '1000',
        longTermGains: '5000',
        ytdWage: '60000',
        ytdFederalWithhold: '12000',
        ytdStateWithhold: '6000',
        futureWage: '40000',
        futureFederalWithhold: '8000',
        futureStateWithhold: '4000'
      })

      const result = aggregateHouseholdIncome(userIncome, spouseIncome, 'marriedFilingJointly')

      // Should combine both incomes
      expect(result.totalIncome).toBe(195500) // User: 86500 + Spouse: 109000
      expect(result.investmentIncome.ordinaryDividends).toBe(3000) // 1000 + 2000
      expect(result.investmentIncome.qualifiedDividends).toBe(2300) // 800 + 1500
      expect(result.investmentIncome.interestIncome).toBe(1500) // 500 + 1000
      expect(result.investmentIncome.shortTermGains).toBe(3000) // 2000 + 1000
      expect(result.investmentIncome.longTermGains).toBe(8000) // 3000 + 5000
      expect(result.wageIncome).toBe(180000) // 80000 + 100000
      expect(result.totalWithholdings.federal).toBe(36000) // 16000 + 20000
      expect(result.totalWithholdings.state).toBe(18000) // 8000 + 10000
    })

    it('should handle empty spouse income when married filing jointly', () => {
      const userIncome = createMockIncome()
      const spouseIncome = createMockIncome({
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
        futureStateWithhold: ''
      })

      const result = aggregateHouseholdIncome(userIncome, spouseIncome, 'marriedFilingJointly')

      // Should handle empty spouse values as zeros
      expect(result.totalIncome).toBe(86500) // Only user income
      expect(result.investmentIncome.ordinaryDividends).toBe(1000)
      expect(result.wageIncome).toBe(80000)
      expect(result.totalWithholdings.federal).toBe(16000)
      expect(result.totalWithholdings.state).toBe(8000)
    })

    it('should handle negative capital gains correctly', () => {
      const userIncome = createMockIncome({
        shortTermGains: '-5000',
        longTermGains: '2000'
      })
      const spouseIncome = createMockIncome({
        shortTermGains: '1000',
        longTermGains: '-8000'
      })

      const result = aggregateHouseholdIncome(userIncome, spouseIncome, 'marriedFilingJointly')

      expect(result.investmentIncome.shortTermGains).toBe(-4000) // -5000 + 1000
      expect(result.investmentIncome.longTermGains).toBe(-6000) // 2000 + -8000
    })
  })

  describe('Edge cases', () => {
    it('should handle all zero income correctly', () => {
      const zeroIncome = createMockIncome({
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
        futureStateWithhold: '0'
      })

      const result = aggregateHouseholdIncome(zeroIncome, zeroIncome, 'marriedFilingJointly')

      expect(result.totalIncome).toBe(0)
      expect(result.wageIncome).toBe(0)
      expect(result.totalWithholdings.federal).toBe(0)
      expect(result.totalWithholdings.state).toBe(0)
    })

    it('should correctly sum all income types', () => {
      const testIncome = createMockIncome({
        ordinaryDividends: '1111',
        qualifiedDividends: '999',
        interestIncome: '2222',
        shortTermGains: '3333',
        longTermGains: '4444',
        ytdWage: '55555',
        futureWage: '44444'
      })

      const result = aggregateHouseholdIncome(testIncome, testIncome, 'marriedFilingJointly')

      // Each income type should be exactly doubled
      expect(result.investmentIncome.ordinaryDividends).toBe(2222)
      expect(result.investmentIncome.qualifiedDividends).toBe(1998)
      expect(result.investmentIncome.interestIncome).toBe(4444)
      expect(result.investmentIncome.shortTermGains).toBe(6666)
      expect(result.investmentIncome.longTermGains).toBe(8888)
      expect(result.wageIncome).toBe(199998) // (55555 + 44444) * 2
    })
  })
})
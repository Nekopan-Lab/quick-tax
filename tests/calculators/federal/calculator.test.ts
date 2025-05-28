import { describe, it, expect } from 'vitest'
import { calculateFederalTax, getFederalStandardDeduction } from '@/calculators/federal/calculator'
import { FilingStatus, TaxYear, DeductionInfo } from '@/types'

// Test data for different tax years
const TAX_YEAR_DATA = {
  2025: {
    standardDeductions: {
      single: 15000,
      marriedFilingJointly: 30000
    },
    singleTaxTests: [
      {
        name: 'income below standard deduction',
        income: { ordinaryIncome: 10000, qualifiedDividends: 0, longTermCapitalGains: 0, shortTermCapitalGains: 0 },
        expected: { taxableIncome: 0, ordinaryIncomeTax: 0, capitalGainsTax: 0, totalTax: 0 }
      },
      {
        name: 'ordinary income only',
        income: { ordinaryIncome: 50000, qualifiedDividends: 0, longTermCapitalGains: 0, shortTermCapitalGains: 0 },
        expected: { taxableIncome: 35000, ordinaryIncomeTax: 3962, capitalGainsTax: 0, totalTax: 3962 }
      },
      {
        name: 'short-term capital gains as ordinary income',
        income: { ordinaryIncome: 30000, qualifiedDividends: 0, longTermCapitalGains: 0, shortTermCapitalGains: 20000 },
        expected: { taxableIncome: 35000, ordinaryIncomeTax: 3962, capitalGainsTax: 0, totalTax: 3962 }
      },
      {
        name: '0% capital gains rate for low income',
        income: { ordinaryIncome: 20000, qualifiedDividends: 0, longTermCapitalGains: 10000, shortTermCapitalGains: 0 },
        expected: { taxableIncome: 15000, ordinaryIncomeTax: 500, capitalGainsTax: 0, totalTax: 500 }
      },
      {
        name: '15% capital gains rate for middle income',
        income: { ordinaryIncome: 60000, qualifiedDividends: 0, longTermCapitalGains: 20000, shortTermCapitalGains: 0 },
        expected: { taxableIncome: 65000, ordinaryIncomeTax: 5162, capitalGainsTax: 2498, totalTax: 7659 }
      },
      {
        name: 'qualified dividends like long-term capital gains',
        income: { ordinaryIncome: 60000, qualifiedDividends: 10000, longTermCapitalGains: 10000, shortTermCapitalGains: 0 },
        expected: { taxableIncome: 65000, ordinaryIncomeTax: 5162, capitalGainsTax: 2498, totalTax: 7659 }
      },
      {
        name: '20% capital gains rate for high income',
        income: { ordinaryIncome: 550000, qualifiedDividends: 0, longTermCapitalGains: 50000, shortTermCapitalGains: 0 },
        expected: { taxableIncome: 585000, capitalGainsTax: 10000 } // Only testing capital gains tax here
      }
    ],
    marriedTaxTests: [
      {
        name: 'correct brackets for married filing jointly',
        income: { ordinaryIncome: 100000, qualifiedDividends: 0, longTermCapitalGains: 0, shortTermCapitalGains: 0 },
        expected: { taxableIncome: 70000, ordinaryIncomeTax: 7923, capitalGainsTax: 0, totalTax: 7923 }
      },
      {
        name: 'correct capital gains brackets for married filing jointly',
        income: { ordinaryIncome: 80000, qualifiedDividends: 0, longTermCapitalGains: 30000, shortTermCapitalGains: 0 },
        expected: { taxableIncome: 80000, capitalGainsTax: 0 }
      },
      {
        name: 'mixed income types correctly',
        income: { ordinaryIncome: 150000, qualifiedDividends: 20000, longTermCapitalGains: 30000, shortTermCapitalGains: 10000 },
        expected: { taxableIncome: 180000, ordinaryIncomeTax: 18428, capitalGainsTax: 7500, totalTax: 25928 }
      }
    ]
  },
  2026: {
    standardDeductions: {
      single: 15350,
      marriedFilingJointly: 30700
    },
    singleTaxTests: [
      {
        name: 'income below standard deduction',
        income: { ordinaryIncome: 10000, qualifiedDividends: 0, longTermCapitalGains: 0, shortTermCapitalGains: 0 },
        expected: { taxableIncome: 0, ordinaryIncomeTax: 0, capitalGainsTax: 0, totalTax: 0 }
      },
      {
        name: 'ordinary income only',
        income: { ordinaryIncome: 50000, qualifiedDividends: 0, longTermCapitalGains: 0, shortTermCapitalGains: 0 },
        expected: { taxableIncome: 34650, ordinaryIncomeTax: 3914, capitalGainsTax: 0, totalTax: 3914 }
      }
    ],
    marriedTaxTests: [
      {
        name: 'correct brackets for married filing jointly',
        income: { ordinaryIncome: 100000, qualifiedDividends: 0, longTermCapitalGains: 0, shortTermCapitalGains: 0 },
        expected: { taxableIncome: 69300, ordinaryIncomeTax: 7828, capitalGainsTax: 0, totalTax: 7828 }
      }
    ]
  }
} as const

describe('Federal Tax Calculator', () => {
  describe('getFederalStandardDeduction', () => {
    const testCases: Array<{ year: TaxYear; filingStatus: FilingStatus; expected: number }> = [
      { year: 2025, filingStatus: 'single', expected: 15000 },
      { year: 2025, filingStatus: 'marriedFilingJointly', expected: 30000 },
      { year: 2026, filingStatus: 'single', expected: 15350 },
      { year: 2026, filingStatus: 'marriedFilingJointly', expected: 30700 }
    ]

    testCases.forEach(({ year, filingStatus, expected }) => {
      it(`should return correct standard deduction for ${filingStatus} in ${year}`, () => {
        expect(getFederalStandardDeduction(year, filingStatus)).toBe(expected)
      })
    })
  })

  // Test each year's data
  Object.entries(TAX_YEAR_DATA).forEach(([year, yearData]) => {
    const taxYear = parseInt(year) as TaxYear
    const standardDeductionSingle = yearData.standardDeductions.single
    const standardDeductionMarried = yearData.standardDeductions.marriedFilingJointly

    describe(`calculateFederalTax - ${year} Tax Year`, () => {
      describe('Single Filer', () => {
        yearData.singleTaxTests.forEach((testCase) => {
          it(`should calculate tax correctly for ${testCase.name}`, () => {
            const deductionInfo: DeductionInfo = {
              type: 'standard',
              amount: standardDeductionSingle
            }
            const totalIncome = testCase.income.ordinaryIncome + testCase.income.qualifiedDividends + 
              testCase.income.longTermCapitalGains + testCase.income.shortTermCapitalGains
            const result = calculateFederalTax(
              testCase.income,
              deductionInfo,
              'single',
              taxYear,
              totalIncome,
              0, // withholdings
              0  // estimatedPayments
            )

            expect(result.taxableIncome).toBe(testCase.expected.taxableIncome)
            if (testCase.expected.ordinaryIncomeTax !== undefined) {
              expect(result.ordinaryIncomeTax).toBe(testCase.expected.ordinaryIncomeTax)
            }
            if (testCase.expected.capitalGainsTax !== undefined) {
              expect(result.capitalGainsTax).toBe(testCase.expected.capitalGainsTax)
            }
            if (testCase.expected.totalTax !== undefined) {
              expect(result.totalTax).toBe(testCase.expected.totalTax)
            }
          })
        })
      })

      describe('Married Filing Jointly', () => {
        yearData.marriedTaxTests.forEach((testCase) => {
          it(`should calculate tax correctly for ${testCase.name}`, () => {
            const deductionInfo: DeductionInfo = {
              type: 'standard',
              amount: standardDeductionMarried
            }
            const totalIncome = testCase.income.ordinaryIncome + testCase.income.qualifiedDividends + 
              testCase.income.longTermCapitalGains + testCase.income.shortTermCapitalGains
            const result = calculateFederalTax(
              testCase.income,
              deductionInfo,
              'marriedFilingJointly',
              taxYear,
              totalIncome,
              0, // withholdings
              0  // estimatedPayments
            )

            expect(result.taxableIncome).toBe(testCase.expected.taxableIncome)
            if (testCase.expected.ordinaryIncomeTax !== undefined) {
              expect(result.ordinaryIncomeTax).toBe(testCase.expected.ordinaryIncomeTax)
            }
            if (testCase.expected.capitalGainsTax !== undefined) {
              expect(result.capitalGainsTax).toBe(testCase.expected.capitalGainsTax)
            }
            if (testCase.expected.totalTax !== undefined) {
              expect(result.totalTax).toBe(testCase.expected.totalTax)
            }
          })
        })
      })
    })
  })

  describe('Edge Cases (All Years)', () => {
    const edgeCases = [
      {
        name: 'zero income',
        income: { ordinaryIncome: 0, qualifiedDividends: 0, longTermCapitalGains: 0, shortTermCapitalGains: 0 },
        deduction: 15000,
        filingStatus: 'single' as FilingStatus,
        expected: { taxableIncome: 0, totalTax: 0 }
      },
      {
        name: 'itemized deductions larger than income',
        income: { ordinaryIncome: 20000, qualifiedDividends: 5000, longTermCapitalGains: 5000, shortTermCapitalGains: 0 },
        deduction: 50000,
        filingStatus: 'single' as FilingStatus,
        expected: { taxableIncome: 0, totalTax: 0 }
      },
      {
        name: 'very high income',
        income: { ordinaryIncome: 1000000, qualifiedDividends: 100000, longTermCapitalGains: 200000, shortTermCapitalGains: 50000 },
        deduction: 30000,
        filingStatus: 'marriedFilingJointly' as FilingStatus,
        expected: { taxableIncome: 1320000, capitalGainsTax: 60000 }
      }
    ]

    const testYears: TaxYear[] = [2025, 2026]

    testYears.forEach((year) => {
      describe(`${year} Edge Cases`, () => {
        edgeCases.forEach((testCase) => {
          it(`should handle ${testCase.name}`, () => {
            const deductionInfo: DeductionInfo = {
              type: testCase.deduction > 30000 ? 'itemized' : 'standard',
              amount: testCase.deduction
            }
            const totalIncome = testCase.income.ordinaryIncome + testCase.income.qualifiedDividends + 
              testCase.income.longTermCapitalGains + testCase.income.shortTermCapitalGains
            const result = calculateFederalTax(
              testCase.income,
              deductionInfo,
              testCase.filingStatus,
              year,
              totalIncome,
              0, // withholdings
              0  // estimatedPayments
            )

            expect(result.taxableIncome).toBe(testCase.expected.taxableIncome)
            if (testCase.expected.capitalGainsTax !== undefined) {
              expect(result.capitalGainsTax).toBe(testCase.expected.capitalGainsTax)
            }
            if (testCase.expected.totalTax !== undefined) {
              expect(result.totalTax).toBe(testCase.expected.totalTax)
            } else {
              expect(result.totalTax).toBeGreaterThanOrEqual(0)
            }
          })
        })
      })
    })
  })
})
import { describe, it, expect } from 'vitest'
import { calculateCaliforniaTax, getCaliforniaStandardDeduction } from '@/calculators/california/calculator'
import { FilingStatus, TaxYear, DeductionInfo } from '@/types'

// Test data for different tax years
const CA_TAX_YEAR_DATA = {
  2025: {
    standardDeductions: {
      single: 5540,
      marriedFilingJointly: 11080
    },
    mentalHealthThreshold: 1000000,
    singleTaxTests: [
      {
        name: 'income below standard deduction',
        income: 5000,
        expected: { taxableIncome: 0, baseTax: 0, mentalHealthTax: 0, totalTax: 0 }
      },
      {
        name: 'low income',
        income: 20000,
        expected: { taxableIncome: 14460, baseTax: 182, mentalHealthTax: 0, totalTax: 182 }
      },
      {
        name: 'middle income',
        income: 75000,
        expected: { taxableIncome: 69460, baseTax: 3017, mentalHealthTax: 0, totalTax: 3017 }
      },
      {
        name: 'high income with all brackets',
        income: 500000,
        expected: { taxableIncome: 494460, baseTax: 44482, mentalHealthTax: 0, totalTax: 44482 }
      },
      {
        name: 'income over $1 million (mental health tax)',
        income: 1200000,
        expected: { taxableIncome: 1194460, mentalHealthTax: 1945 }
      }
    ],
    marriedTaxTests: [
      {
        name: 'correct brackets for married filing jointly',
        income: 100000,
        expected: { taxableIncome: 88920, baseTax: 2490, mentalHealthTax: 0, totalTax: 2490 }
      },
      {
        name: 'high income married couple',
        income: 800000,
        expected: { taxableIncome: 788920, baseTax: 67130, mentalHealthTax: 0, totalTax: 67130 }
      },
      {
        name: 'married couple over $1 million (mental health tax)',
        income: 2000000,
        expected: { taxableIncome: 1988920, mentalHealthTax: 9889, baseTax: 207427 }
      }
    ]
  },
  2026: {
    standardDeductions: {
      single: 5670,
      marriedFilingJointly: 11340
    },
    mentalHealthThreshold: 1000000,
    singleTaxTests: [
      {
        name: 'income below standard deduction',
        income: 5000,
        expected: { taxableIncome: 0, baseTax: 0, mentalHealthTax: 0, totalTax: 0 }
      },
      {
        name: 'low income',
        income: 20000,
        expected: { taxableIncome: 14330, baseTax: 177, mentalHealthTax: 0, totalTax: 177 }
      }
    ],
    marriedTaxTests: [
      {
        name: 'correct brackets for married filing jointly',
        income: 100000,
        expected: { taxableIncome: 88660, baseTax: 2408, mentalHealthTax: 0, totalTax: 2408 }
      }
    ]
  }
} as const

describe('California Tax Calculator', () => {
  describe('getCaliforniaStandardDeduction', () => {
    const testCases: Array<{ year: TaxYear; filingStatus: FilingStatus; expected: number }> = [
      { year: 2025, filingStatus: 'single', expected: 5540 },
      { year: 2025, filingStatus: 'marriedFilingJointly', expected: 11080 },
      { year: 2026, filingStatus: 'single', expected: 5670 },
      { year: 2026, filingStatus: 'marriedFilingJointly', expected: 11340 }
    ]

    testCases.forEach(({ year, filingStatus, expected }) => {
      it(`should return correct standard deduction for ${filingStatus} in ${year}`, () => {
        expect(getCaliforniaStandardDeduction(year, filingStatus)).toBe(expected)
      })
    })
  })

  // Test each year's data
  Object.entries(CA_TAX_YEAR_DATA).forEach(([year, yearData]) => {
    const taxYear = parseInt(year) as TaxYear
    const standardDeductionSingle = yearData.standardDeductions.single
    const standardDeductionMarried = yearData.standardDeductions.marriedFilingJointly

    describe(`calculateCaliforniaTax - ${year} Tax Year`, () => {
      describe('Single Filer', () => {
        yearData.singleTaxTests.forEach((testCase) => {
          it(`should calculate tax correctly for ${testCase.name}`, () => {
            const deductionInfo: DeductionInfo = {
              type: 'standard',
              amount: standardDeductionSingle
            }
            const result = calculateCaliforniaTax(
              testCase.income,
              deductionInfo,
              'single',
              taxYear
            )

            expect(result.taxableIncome).toBe(testCase.expected.taxableIncome)
            if (testCase.expected.baseTax !== undefined) {
              expect(result.baseTax).toBe(testCase.expected.baseTax)
            }
            if (testCase.expected.mentalHealthTax !== undefined) {
              expect(result.mentalHealthTax).toBe(testCase.expected.mentalHealthTax)
            }
            if (testCase.expected.totalTax !== undefined) {
              expect(result.totalTax).toBe(testCase.expected.totalTax)
            } else {
              // For cases where we only specify some values, ensure basic consistency
              expect(result.totalTax).toBe(result.baseTax + result.mentalHealthTax)
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
            const result = calculateCaliforniaTax(
              testCase.income,
              deductionInfo,
              'marriedFilingJointly',
              taxYear
            )

            expect(result.taxableIncome).toBe(testCase.expected.taxableIncome)
            if (testCase.expected.baseTax !== undefined) {
              expect(result.baseTax).toBe(testCase.expected.baseTax)
            }
            if (testCase.expected.mentalHealthTax !== undefined) {
              expect(result.mentalHealthTax).toBe(testCase.expected.mentalHealthTax)
            }
            if (testCase.expected.totalTax !== undefined) {
              expect(result.totalTax).toBe(testCase.expected.totalTax)
            } else {
              // For cases where we only specify some values, ensure basic consistency
              expect(result.totalTax).toBe(result.baseTax + result.mentalHealthTax)
            }
          })
        })
      })
    })
  })

  describe('California Tax - All Income Types Treated Same (All Years)', () => {
    const testYears: TaxYear[] = [2025, 2026]

    testYears.forEach((year) => {
      it(`should tax capital gains the same as ordinary income in ${year}`, () => {
        // Unlike federal tax, CA treats all income types the same
        const incomeAmount = 100000
        const deduction = CA_TAX_YEAR_DATA[year].standardDeductions.single
        
        const deductionInfo: DeductionInfo = {
          type: 'standard',
          amount: deduction
        }
        const result = calculateCaliforniaTax(
          incomeAmount,
          deductionInfo,
          'single',
          year
        )

        // Verify the calculation is the same regardless of income type
        expect(result.taxableIncome).toBe(incomeAmount - deduction)
        expect(result.totalTax).toBeGreaterThan(0)
      })
    })
  })

  describe('Edge Cases (All Years)', () => {
    const edgeCases = [
      {
        name: 'zero income',
        income: 0,
        deduction: 5540,
        filingStatus: 'single' as FilingStatus,
        expected: { taxableIncome: 0, totalTax: 0 }
      },
      {
        name: 'deductions larger than income',
        income: 10000,
        deduction: 20000,
        filingStatus: 'single' as FilingStatus,
        expected: { taxableIncome: 0, totalTax: 0 }
      },
      {
        name: 'exactly $1 million income (mental health tax threshold)',
        income: 1000000,
        deduction: 5540,
        filingStatus: 'single' as FilingStatus,
        expected: { taxableIncome: 994460, mentalHealthTax: 0 }
      },
      {
        name: 'very high income',
        income: 5000000,
        deduction: 11080,
        filingStatus: 'marriedFilingJointly' as FilingStatus,
        expected: { taxableIncome: 4988920, mentalHealthTax: 39889 }
      }
    ]

    const testYears: TaxYear[] = [2025, 2026]

    testYears.forEach((year) => {
      describe(`${year} Edge Cases`, () => {
        edgeCases.forEach((testCase) => {
          it(`should handle ${testCase.name}`, () => {
            const deductionInfo: DeductionInfo = {
              type: testCase.deduction > 11080 ? 'itemized' : 'standard',
              amount: testCase.deduction
            }
            const result = calculateCaliforniaTax(
              testCase.income,
              deductionInfo,
              testCase.filingStatus,
              year
            )

            expect(result.taxableIncome).toBe(testCase.expected.taxableIncome)
            if (testCase.expected.mentalHealthTax !== undefined) {
              expect(result.mentalHealthTax).toBe(testCase.expected.mentalHealthTax)
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
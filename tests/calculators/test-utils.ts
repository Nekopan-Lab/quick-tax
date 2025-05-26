import { TaxYear, FilingStatus } from '@/types'

/**
 * Helper to generate test cases for all supported years
 */
export function testAllYears<T>(
  supportedYears: TaxYear[],
  testFunction: (year: TaxYear) => T
): Array<{ year: TaxYear; result: T }> {
  return supportedYears.map(year => ({
    year,
    result: testFunction(year)
  }))
}

/**
 * Helper to create consistent test descriptions across years
 */
export function createYearTestDescription(year: TaxYear, testName: string): string {
  return `${testName} (${year} tax year)`
}

/**
 * Common test scenarios that apply to all years
 */
export const COMMON_EDGE_CASES = {
  zeroIncome: {
    name: 'zero income',
    getTestData: (year: TaxYear) => ({
      income: 0,
      filingStatus: 'single' as FilingStatus,
      expected: { taxableIncome: 0, totalTax: 0 }
    })
  },
  largeDeductions: {
    name: 'deductions larger than income',
    getTestData: (year: TaxYear) => ({
      income: 10000,
      deduction: 20000,
      filingStatus: 'single' as FilingStatus,
      expected: { taxableIncome: 0, totalTax: 0 }
    })
  }
}

/**
 * Standard deduction test cases for all years
 */
export const STANDARD_DEDUCTION_TEST_CASES = [
  { filingStatus: 'single' as FilingStatus },
  { filingStatus: 'marriedFilingJointly' as FilingStatus }
]

/**
 * Type for test case with flexible expected values
 */
export interface FlexibleTestCase<T = any> {
  name: string
  input: T
  expected: Partial<Record<string, any>>
}

/**
 * Helper to validate flexible test case results
 */
export function validateFlexibleResults(
  actual: Record<string, any>,
  expected: Partial<Record<string, any>>
): void {
  Object.entries(expected).forEach(([key, value]) => {
    if (value !== undefined) {
      expect(actual[key]).toBe(value)
    }
  })
}

/**
 * Constants for supported tax years
 */
export const SUPPORTED_TAX_YEARS: TaxYear[] = [2025, 2026]

/**
 * Helper to get year-specific test data
 */
export function getYearTestData<T>(
  yearData: Record<TaxYear, T>,
  year: TaxYear
): T {
  if (!(year in yearData)) {
    throw new Error(`Test data not found for year ${year}`)
  }
  return yearData[year]
}

/**
 * Documentation helper for adding new tax year tests
 */
export const NEW_YEAR_TEST_CHECKLIST = `
To add tests for a new tax year (e.g., 2027):

1. Add 2027 to the TaxYear type in /src/types/index.ts
2. Add 2027 to SUPPORTED_TAX_YEARS constant in this file
3. Add 2027 data to TAX_YEAR_DATA in federal calculator tests
4. Add 2027 data to CA_TAX_YEAR_DATA in California calculator tests
5. Calculate expected values for the new year's tax brackets
6. Run tests to ensure all scenarios pass

The test framework will automatically:
- Run all existing test scenarios for the new year
- Validate standard deductions for the new year
- Test edge cases with the new year's data
`
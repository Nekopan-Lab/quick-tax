import { FilingStatus } from '@/types'
import { TaxYear } from '../federal/constants'
import { 
  getCaliforniaTaxBrackets,
  getCaliforniaStandardDeduction,
  getCaliforniaMentalHealthTaxThreshold,
  getCaliforniaMentalHealthTaxRate
} from './constants'
import { calculateProgressiveTax } from '../utils/taxBrackets'

export interface CaliforniaIncomeBreakdown {
  totalIncome: number // California taxes all income types the same
}

export interface CaliforniaTaxResult {
  taxableIncome: number
  baseTax: number
  mentalHealthTax: number
  totalTax: number
}

/**
 * Calculate California income tax
 * California treats all income types (wages, dividends, capital gains) the same
 * @param income - Total income amount
 * @param deductions - Total deduction amount (standard or itemized)
 * @param filingStatus - Filing status (single or marriedFilingJointly)
 * @param taxYear - Tax year for calculations
 * @returns California tax calculation result
 */
export function calculateCaliforniaTax(
  income: number,
  deductions: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear
): CaliforniaTaxResult {
  // Calculate taxable income after deductions
  const taxableIncome = Math.max(0, income - deductions)
  
  // Calculate base California tax using progressive brackets
  const baseTax = calculateProgressiveTax(
    taxableIncome,
    getCaliforniaTaxBrackets(taxYear, filingStatus)
  )
  
  // Calculate mental health services tax (1% on income over $1M)
  let mentalHealthTax = 0
  const threshold = getCaliforniaMentalHealthTaxThreshold(taxYear)
  const rate = getCaliforniaMentalHealthTaxRate(taxYear)
  if (taxableIncome > threshold) {
    mentalHealthTax = (taxableIncome - threshold) * rate
  }
  
  return {
    taxableIncome,
    baseTax: Math.round(baseTax),
    mentalHealthTax: Math.round(mentalHealthTax),
    totalTax: Math.round(baseTax + mentalHealthTax)
  }
}

// Re-export the helper function for backwards compatibility
export { getCaliforniaStandardDeduction }
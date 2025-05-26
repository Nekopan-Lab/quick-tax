import { FilingStatus } from '@/types'
import { 
  CALIFORNIA_TAX_BRACKETS, 
  CALIFORNIA_STANDARD_DEDUCTION,
  CALIFORNIA_MENTAL_HEALTH_TAX_THRESHOLD,
  CALIFORNIA_MENTAL_HEALTH_TAX_RATE
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
 * @returns California tax calculation result
 */
export function calculateCaliforniaTax(
  income: number,
  deductions: number,
  filingStatus: FilingStatus
): CaliforniaTaxResult {
  // Calculate taxable income after deductions
  const taxableIncome = Math.max(0, income - deductions)
  
  // Calculate base California tax using progressive brackets
  const baseTax = calculateProgressiveTax(
    taxableIncome,
    CALIFORNIA_TAX_BRACKETS[filingStatus]
  )
  
  // Calculate mental health services tax (1% on income over $1M)
  let mentalHealthTax = 0
  if (taxableIncome > CALIFORNIA_MENTAL_HEALTH_TAX_THRESHOLD) {
    mentalHealthTax = (taxableIncome - CALIFORNIA_MENTAL_HEALTH_TAX_THRESHOLD) * CALIFORNIA_MENTAL_HEALTH_TAX_RATE
  }
  
  return {
    taxableIncome,
    baseTax: Math.round(baseTax * 100) / 100,
    mentalHealthTax: Math.round(mentalHealthTax * 100) / 100,
    totalTax: Math.round((baseTax + mentalHealthTax) * 100) / 100
  }
}

/**
 * Get the California standard deduction for a given filing status
 * @param filingStatus - Filing status
 * @returns Standard deduction amount
 */
export function getCaliforniaStandardDeduction(filingStatus: FilingStatus): number {
  return CALIFORNIA_STANDARD_DEDUCTION[filingStatus]
}
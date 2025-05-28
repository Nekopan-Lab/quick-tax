import { FilingStatus, DeductionInfo } from '@/types'
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
  taxableIncome: number      // Income after deductions
  baseTax: number            // Tax calculated from standard brackets
  mentalHealthTax: number    // Additional 1% tax on income over $1M
  totalTax: number           // Total tax liability (before any withholdings or payments)
  deduction: DeductionInfo   // Deduction type and amount used for CA tax calculation
  owedOrRefund: number       // Final amount owed (positive) or refunded (negative) after subtracting withholdings and estimated payments
  effectiveRate: number      // Effective tax rate as percentage
}

/**
 * Calculate California income tax
 * California treats all income types (wages, dividends, capital gains) the same
 * @param income - Total income amount
 * @param deductionInfo - Deduction type and amount
 * @param filingStatus - Filing status (single or marriedFilingJointly)
 * @param taxYear - Tax year for calculations
 * @param withholdings - Total California withholdings
 * @param estimatedPayments - Total estimated payments made
 * @returns California tax calculation result
 */
export function calculateCaliforniaTax(
  income: number,
  deductionInfo: DeductionInfo,
  filingStatus: FilingStatus,
  taxYear: TaxYear,
  withholdings: number,
  estimatedPayments: number
): CaliforniaTaxResult {
  // Calculate taxable income after deductions
  const taxableIncome = Math.max(0, income - deductionInfo.amount)
  
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
  
  const totalTax = Math.round(baseTax + mentalHealthTax)
  const owedOrRefund = totalTax - withholdings - estimatedPayments
  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0
  
  return {
    taxableIncome,
    baseTax: Math.round(baseTax),
    mentalHealthTax: Math.round(mentalHealthTax),
    totalTax,
    deduction: deductionInfo,
    owedOrRefund: Math.round(owedOrRefund),
    effectiveRate
  }
}

// Re-export the helper function for backwards compatibility
export { getCaliforniaStandardDeduction }

// Import types from federal calculator for shared interfaces
import type { DeductionsData, EstimatedPaymentsData, EstimatedPaymentSuggestion } from '../federal/calculator'

// Income data interface for California calculations
export interface IncomeData {
  ordinaryDividends: string
  qualifiedDividends: string
  interestIncome: string
  shortTermGains: string
  longTermGains: string
  ytdWage: string
  ytdFederalWithhold: string
  ytdStateWithhold: string
  futureWage: string
  futureFederalWithhold: string
  futureStateWithhold: string
  incomeMode: 'simple' | 'detailed'
  paycheckWage: string
  paycheckFederal: string
  paycheckState: string
  payFrequency: 'biweekly' | 'monthly'
  nextPayDate: string
  rsuVestWage: string
  rsuVestFederal: string
  rsuVestState: string
  vestPrice: string
  futureRSUVests: Array<{
    id: string
    date: string
    shares: string
    expectedPrice: string
  }>
}

/**
 * Calculate California itemized deductions (no SALT cap, always $1M mortgage limit)
 */
export function calculateCaliforniaItemizedDeductions(
  deductions: DeductionsData
): number {
  const propertyTax = parseFloat(deductions.propertyTax) || 0
  const mortgageInterest = parseFloat(deductions.mortgageInterest) || 0
  const donations = parseFloat(deductions.donations) || 0
  const mortgageBalance = parseFloat(deductions.mortgageBalance) || 0
  
  // California doesn't have SALT cap for property tax
  // Note: CA state income tax cannot be deducted on CA return
  
  // Calculate mortgage interest deduction with CA's $1M limit
  let deductibleMortgageInterest = mortgageInterest
  if (mortgageBalance > 1000000) {
    deductibleMortgageInterest = mortgageInterest * (1000000 / mortgageBalance)
  }
  
  return propertyTax + deductibleMortgageInterest + donations
}

/**
 * Calculate suggested California estimated tax payments with cumulative schedule
 * California requires cumulative payments: Q1: 30%, Q2: 70%, Q4: 100%
 */
export function calculateCaliforniaEstimatedPayments(
  totalTaxOwed: number,
  estimatedPayments: EstimatedPaymentsData
): EstimatedPaymentSuggestion[] {
  const currentDate = new Date()
  const quarters = [
    { quarter: 'Q1', dueDate: 'April 15, 2025', dueDateObj: new Date('2025-04-15'), cumulativePercentage: 0.30, paid: parseFloat(estimatedPayments.californiaQ1) || 0 },
    { quarter: 'Q2', dueDate: 'June 16, 2025', dueDateObj: new Date('2025-06-16'), cumulativePercentage: 0.70, paid: parseFloat(estimatedPayments.californiaQ2) || 0 },
    { quarter: 'Q4', dueDate: 'January 15, 2026', dueDateObj: new Date('2026-01-15'), cumulativePercentage: 1.00, paid: parseFloat(estimatedPayments.californiaQ4) || 0 }
  ]
  
  const results: EstimatedPaymentSuggestion[] = []
  let cumulativePaid = 0
  
  // Process each quarter in sequence
  for (let i = 0; i < quarters.length; i++) {
    const q = quarters[i]
    const isPastDue = q.dueDateObj <= currentDate
    
    // If this quarter is already paid
    if (q.paid > 0) {
      cumulativePaid += q.paid
      results.push({
        quarter: q.quarter,
        dueDate: q.dueDate,
        amount: q.paid,
        isPaid: true,
        isPastDue: false
      })
      continue
    }
    
    // If past due and not paid
    if (isPastDue) {
      results.push({
        quarter: q.quarter,
        dueDate: q.dueDate,
        amount: 0,
        isPaid: false,
        isPastDue: true
      })
      continue
    }
    
    // Calculate required cumulative amount by this quarter
    const requiredCumulative = totalTaxOwed * q.cumulativePercentage
    
    // Calculate how much needs to be paid this quarter to catch up
    const catchUpAmount = Math.max(0, requiredCumulative - cumulativePaid)
    
    // Assume this payment will be made for future calculations
    cumulativePaid += catchUpAmount
    
    results.push({
      quarter: q.quarter,
      dueDate: q.dueDate,
      amount: catchUpAmount,
      isPaid: false,
      isPastDue: false
    })
  }
  
  return results
}

/**
 * Calculate estimated California state tax for SALT deduction
 * This is a simplified calculation used for federal SALT deduction estimation
 */
export function calculateEstimatedCAStateTax(
  totalIncome: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear
): number {
  // Simplified CA tax calculation for SALT estimation
  const standardDeduction = getCaliforniaStandardDeduction(taxYear, filingStatus)
  const deductionInfo: DeductionInfo = {
    type: 'standard',
    amount: standardDeduction
  }
  
  const caResult = calculateCaliforniaTax(totalIncome, deductionInfo, filingStatus, taxYear, 0, 0)
  return caResult.totalTax
}

/**
 * Calculate California withholdings from income data
 */
export function calculateCaliforniaWithholdings(
  userWithholdings: { state: number },
  spouseWithholdings: { state: number } | null
): number {
  return userWithholdings.state + (spouseWithholdings?.state || 0)
}
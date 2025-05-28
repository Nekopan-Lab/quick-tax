import { FilingStatus, DeductionInfo } from '@/types'
import { 
  TaxYear,
  getFederalTaxBrackets,
  getFederalStandardDeduction,
  getFederalCapitalGainsBrackets
} from './constants'
import { calculateProgressiveTax } from '../utils/taxBrackets'

export interface FederalIncomeBreakdown {
  ordinaryIncome: number
  qualifiedDividends: number
  longTermCapitalGains: number
  shortTermCapitalGains: number
}

export interface FederalTaxResult {
  taxableIncome: number        // Income after deductions
  ordinaryIncomeTax: number    // Tax on wages, interest, non-qualified dividends, short-term gains
  capitalGainsTax: number      // Tax on qualified dividends and long-term capital gains
  totalTax: number             // Total tax liability (before any withholdings or payments)
  deduction: DeductionInfo     // Deduction type and amount used for federal tax calculation
}

/**
 * Calculate federal income tax based on income breakdown and deductions
 * @param income - Breakdown of different income types
 * @param deductionInfo - Deduction type and amount
 * @param filingStatus - Filing status (single or marriedFilingJointly)
 * @param taxYear - Tax year for calculations
 * @returns Federal tax calculation result
 */
export function calculateFederalTax(
  income: FederalIncomeBreakdown,
  deductionInfo: DeductionInfo,
  filingStatus: FilingStatus,
  taxYear: TaxYear
): FederalTaxResult {
  // Calculate total income
  const totalIncome = 
    income.ordinaryIncome + 
    income.qualifiedDividends + 
    income.longTermCapitalGains + 
    income.shortTermCapitalGains

  // Calculate taxable income after deductions
  const taxableIncome = Math.max(0, totalIncome - deductionInfo.amount)

  // Short-term capital gains are taxed as ordinary income
  const ordinaryIncomeForTax = income.ordinaryIncome + income.shortTermCapitalGains
  
  // Calculate ordinary taxable income (excluding qualified dividends and LTCG)
  const ordinaryTaxableIncome = Math.max(0, ordinaryIncomeForTax - deductionInfo.amount)
  
  // Calculate tax on ordinary income
  const ordinaryIncomeTax = calculateProgressiveTax(
    ordinaryTaxableIncome,
    getFederalTaxBrackets(taxYear, filingStatus)
  )

  // Calculate capital gains and qualified dividends tax
  // First, we need to determine how much of the deduction has been used by ordinary income
  const deductionUsedByOrdinary = Math.min(deductionInfo.amount, ordinaryIncomeForTax)
  const remainingDeduction = deductionInfo.amount - deductionUsedByOrdinary
  
  // Apply remaining deduction to capital gains and qualified dividends
  const capitalGainsAndDividends = income.qualifiedDividends + income.longTermCapitalGains
  const taxableCapitalGainsAndDividends = Math.max(0, capitalGainsAndDividends - remainingDeduction)
  
  // For capital gains tax calculation, we need to consider the stack on top of ordinary income
  // The capital gains rate depends on total taxable income
  let capitalGainsTax = 0
  
  if (taxableCapitalGainsAndDividends > 0) {
    const brackets = getFederalCapitalGainsBrackets(taxYear, filingStatus)
    let remainingCapGains = taxableCapitalGainsAndDividends
    let currentIncome = ordinaryTaxableIncome // Start from where ordinary income ends
    
    for (const bracket of brackets) {
      if (remainingCapGains <= 0) break
      
      // Calculate how much room we have in this bracket
      const roomInBracket = Math.max(0, bracket.max - currentIncome)
      const taxableInThisBracket = Math.min(remainingCapGains, roomInBracket)
      
      capitalGainsTax += taxableInThisBracket * bracket.rate
      remainingCapGains -= taxableInThisBracket
      currentIncome += taxableInThisBracket
    }
  }

  return {
    taxableIncome,
    ordinaryIncomeTax: Math.round(ordinaryIncomeTax),
    capitalGainsTax: Math.round(capitalGainsTax),
    totalTax: Math.round(ordinaryIncomeTax + capitalGainsTax),
    deduction: deductionInfo
  }
}

// Re-export the helper function for backwards compatibility
export { getFederalStandardDeduction }

// Interfaces for deductions and payments
export interface DeductionsData {
  propertyTax: string
  mortgageInterest: string
  donations: string
  mortgageLoanDate: 'before-dec-16-2017' | 'after-dec-15-2017' | ''
  mortgageBalance: string
  otherStateIncomeTax: string
}

export interface EstimatedPaymentsData {
  federalQ1: string
  federalQ2: string
  federalQ3: string
  federalQ4: string
  californiaQ1: string
  californiaQ2: string
  californiaQ4: string
}

export interface EstimatedPaymentSuggestion {
  quarter: string
  dueDate: string
  amount: number
  isPaid: boolean
  isPastDue: boolean
}

/**
 * Calculate federal itemized deductions with SALT cap and mortgage interest limits
 */
export function calculateFederalItemizedDeductions(
  deductions: DeductionsData,
  estimatedCAStateTax: number,
  includeCaliforniaTax: boolean
): number {
  const propertyTax = parseFloat(deductions.propertyTax) || 0
  const mortgageInterest = parseFloat(deductions.mortgageInterest) || 0
  const donations = parseFloat(deductions.donations) || 0
  const mortgageBalance = parseFloat(deductions.mortgageBalance) || 0
  
  // Calculate state income tax for SALT
  const stateIncomeTax = includeCaliforniaTax 
    ? estimatedCAStateTax
    : parseFloat(deductions.otherStateIncomeTax) || 0
  
  // Apply SALT cap ($10,000 for both single and married filing jointly)
  const saltDeduction = Math.min(propertyTax + stateIncomeTax, 10000)
  
  // Calculate mortgage interest deduction with limits
  let deductibleMortgageInterest = mortgageInterest
  if (mortgageBalance > 0 && deductions.mortgageLoanDate) {
    const mortgageLimit = deductions.mortgageLoanDate === 'before-dec-16-2017' ? 1000000 : 750000
    if (mortgageBalance > mortgageLimit) {
      deductibleMortgageInterest = mortgageInterest * (mortgageLimit / mortgageBalance)
    }
  }
  
  return saltDeduction + deductibleMortgageInterest + donations
}

/**
 * Calculate suggested federal estimated tax payments
 * Federal requires cumulative payments: Q1: 25%, Q2: 50%, Q3: 75%, Q4: 100%
 */
export function calculateFederalEstimatedPayments(
  totalTaxOwed: number,
  estimatedPayments: EstimatedPaymentsData
): EstimatedPaymentSuggestion[] {
  const currentDate = new Date()
  const quarters = [
    { quarter: 'Q1', dueDate: 'April 15, 2025', dueDateObj: new Date('2025-04-15'), cumulativePercentage: 0.25, paid: parseFloat(estimatedPayments.federalQ1) || 0 },
    { quarter: 'Q2', dueDate: 'June 16, 2025', dueDateObj: new Date('2025-06-16'), cumulativePercentage: 0.50, paid: parseFloat(estimatedPayments.federalQ2) || 0 },
    { quarter: 'Q3', dueDate: 'September 15, 2025', dueDateObj: new Date('2025-09-15'), cumulativePercentage: 0.75, paid: parseFloat(estimatedPayments.federalQ3) || 0 },
    { quarter: 'Q4', dueDate: 'January 15, 2026', dueDateObj: new Date('2026-01-15'), cumulativePercentage: 1.00, paid: parseFloat(estimatedPayments.federalQ4) || 0 }
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
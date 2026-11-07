import { FilingStatus, DeductionInfo } from '@/types'
import { DeductionsData, EstimatedPaymentsData } from '@/store/useStore'
import { TaxYear } from '../federal/constants'
import { 
  getCaliforniaTaxBrackets,
  getCaliforniaStandardDeduction,
  getCaliforniaMentalHealthTaxThreshold,
  getCaliforniaMentalHealthTaxRate,
  getCaliforniaCreditData,
  CA_EXEMPTION_PHASEOUT_STEP,
  CA_EXEMPTION_PHASEOUT_PER_CREDIT,
  CA_ITEMIZED_LIMITATION_RATE,
  CA_ITEMIZED_LIMITATION_MAX_SHARE
} from './constants'
import { calculateProgressiveTaxWithDetails, TaxBracketDetail, calculateDistanceToNextBracket, NextBracketInfo } from '../utils/taxBrackets'
import { calculateEstimatedPaymentsWithCumulativeSchedule, type QuarterlyPaymentSchedule } from '../utils/estimatedPayments'

export interface CaliforniaIncomeBreakdown {
  totalIncome: number // California taxes all income types the same
}

export interface CaliforniaTaxResult {
  taxableIncome: number      // Income after deductions
  baseTax: number            // Tax calculated from standard brackets (before credits)
  exemptionCredit: number    // Personal exemption credit applied against base tax (after AGI phaseout)
  mentalHealthTax: number    // Additional 1% tax on income over $1M
  totalTax: number           // Total tax liability (before any withholdings or payments)
  withholdings: number       // California withholdings credited against the tax
  deduction: DeductionInfo   // Deduction type and amount used for CA tax calculation
  owedOrRefund: number       // Final amount owed (positive) or refunded (negative) after subtracting withholdings and estimated payments
  effectiveRate: number      // Effective tax rate as percentage
  taxBrackets: TaxBracketDetail[]  // Detailed bracket calculations
  nextBracketInfo: NextBracketInfo  // Distance to next tax bracket
  distanceToMentalHealthTax: number | null  // Distance to $1M mental health tax threshold (null if already above)
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
 * @param agi - Federal AGI used for the exemption credit phaseout (defaults to income)
 * @returns California tax calculation result
 */
export function calculateCaliforniaTax(
  income: number,
  deductionInfo: DeductionInfo,
  filingStatus: FilingStatus,
  taxYear: TaxYear,
  withholdings: number,
  estimatedPayments: number,
  agi: number = income
): CaliforniaTaxResult {
  // Calculate taxable income after deductions
  const taxableIncome = Math.max(0, income - deductionInfo.amount)
  
  // Calculate base California tax using progressive brackets with details
  const taxResult = calculateProgressiveTaxWithDetails(
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
  
  // Personal exemption credit reduces regular tax (not below zero); it does not offset the mental health tax
  const exemptionCredit = Math.min(
    calculateCaliforniaExemptionCredit(agi, filingStatus, taxYear),
    taxResult.totalTax
  )

  const totalTax = Math.round(taxResult.totalTax - exemptionCredit + mentalHealthTax)
  const owedOrRefund = totalTax - withholdings - estimatedPayments
  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0
  
  // Calculate distance to next bracket
  const nextBracketInfo = calculateDistanceToNextBracket(
    taxableIncome,
    getCaliforniaTaxBrackets(taxYear, filingStatus)
  )

  // Calculate distance to mental health tax threshold
  const distanceToMentalHealthTax = taxableIncome < threshold
    ? threshold - taxableIncome
    : null

  return {
    taxableIncome,
    baseTax: Math.round(taxResult.totalTax),
    exemptionCredit: Math.round(exemptionCredit),
    mentalHealthTax: Math.round(mentalHealthTax),
    totalTax,
    withholdings: Math.round(withholdings),
    deduction: deductionInfo,
    owedOrRefund: Math.round(owedOrRefund),
    effectiveRate,
    taxBrackets: taxResult.bracketDetails,
    nextBracketInfo,
    distanceToMentalHealthTax
  }
}

/**
 * California personal exemption credit after the high-income phaseout.
 * Each credit is reduced by $6 for every $2,500 (or fraction) of federal AGI over the threshold.
 * Single filers have one credit; MFJ filers have two.
 */
export function calculateCaliforniaExemptionCredit(
  agi: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear
): number {
  const data = getCaliforniaCreditData(taxYear)
  const baseCredit = data.personalExemptionCredit[filingStatus]
  const threshold = data.agiLimitationThreshold[filingStatus]
  if (agi <= threshold) return baseCredit

  const numberOfCredits = filingStatus === 'marriedFilingJointly' ? 2 : 1
  const steps = Math.ceil((agi - threshold) / CA_EXEMPTION_PHASEOUT_STEP)
  const reduction = steps * CA_EXEMPTION_PHASEOUT_PER_CREDIT * numberOfCredits
  return Math.max(0, baseCredit - reduction)
}

/**
 * California itemized deduction limitation for high-AGI taxpayers:
 * reduction = lesser of 6% of AGI over the threshold, or 80% of itemized deductions
 */
export function calculateCaliforniaItemizedLimitation(
  itemizedTotal: number,
  agi: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear
): number {
  const threshold = getCaliforniaCreditData(taxYear).agiLimitationThreshold[filingStatus]
  if (agi <= threshold || itemizedTotal <= 0) return 0
  return Math.min(
    (agi - threshold) * CA_ITEMIZED_LIMITATION_RATE,
    itemizedTotal * CA_ITEMIZED_LIMITATION_MAX_SHARE
  )
}

// Re-export the helper function for backwards compatibility
export { getCaliforniaStandardDeduction }

// Import EstimatedPaymentSuggestion from federal calculator  
import type { EstimatedPaymentSuggestion } from '../federal/calculator'


export interface CaliforniaItemizedDeductionDetails {
  propertyTax: number
  mortgageInterest: number
  mortgageBalance: number
  mortgageLimit: number
  effectiveMortgageInterest: number
  mortgageLimited: boolean
  donations: number
  totalBeforeLimitation: number  // Sum of itemized deductions before the high-income limitation
  limitationReduction: number    // High-AGI itemized deduction limitation (0 when AGI is below threshold)
  total: number                  // Itemized deductions after limitation
}

/**
 * Calculate California itemized deductions (no SALT cap, always $1M mortgage limit).
 * When agi, filingStatus and taxYear are given, the high-income limitation is applied.
 */
export function calculateCaliforniaItemizedDeductions(
  deductions: DeductionsData,
  agi?: number,
  filingStatus?: FilingStatus,
  taxYear?: TaxYear
): number {
  const details = calculateCaliforniaItemizedDeductionDetails(deductions, agi, filingStatus, taxYear)
  return details.total
}

/**
 * Calculate California itemized deductions with detailed breakdown
 */
export function calculateCaliforniaItemizedDeductionDetails(
  deductions: DeductionsData,
  agi?: number,
  filingStatus?: FilingStatus,
  taxYear?: TaxYear
): CaliforniaItemizedDeductionDetails {
  const propertyTax = parseFloat(deductions.propertyTax) || 0
  const mortgageInterest = parseFloat(deductions.mortgageInterest) || 0
  const donations = parseFloat(deductions.donations) || 0
  const mortgageBalance = parseFloat(deductions.mortgageBalance) || 0
  
  // California doesn't have SALT cap for property tax
  // Note: CA state income tax cannot be deducted on CA return
  
  // Calculate mortgage interest deduction with CA's $1M limit
  let deductibleMortgageInterest = mortgageInterest
  let mortgageLimited = false
  const mortgageLimit = 1000000
  
  if (mortgageBalance > mortgageLimit) {
    deductibleMortgageInterest = mortgageInterest * (mortgageLimit / mortgageBalance)
    mortgageLimited = true
  }
  
  const totalBeforeLimitation = propertyTax + deductibleMortgageInterest + donations
  const limitationReduction = agi !== undefined && filingStatus && taxYear
    ? calculateCaliforniaItemizedLimitation(totalBeforeLimitation, agi, filingStatus, taxYear)
    : 0

  return {
    propertyTax,
    mortgageInterest,
    mortgageBalance,
    mortgageLimit,
    effectiveMortgageInterest: deductibleMortgageInterest,
    mortgageLimited,
    donations,
    totalBeforeLimitation,
    limitationReduction,
    total: totalBeforeLimitation - limitationReduction
  }
}

/**
 * Calculate suggested California estimated tax payments with cumulative schedule
 * California requires cumulative payments: Q1: 30%, Q2: 70%, Q4: 100%
 */
export const CALIFORNIA_PAYMENT_SCHEDULES: Record<TaxYear, { quarter: string; dueDate: string; dueDateObj: Date; cumulativePercentage: number }[]> = {
  2025: [
    { quarter: 'Q1', dueDate: 'April 15, 2025', dueDateObj: new Date('2025-04-15'), cumulativePercentage: 0.30 },
    { quarter: 'Q2', dueDate: 'June 16, 2025', dueDateObj: new Date('2025-06-16'), cumulativePercentage: 0.70 },
    { quarter: 'Q4', dueDate: 'January 15, 2026', dueDateObj: new Date('2026-01-15'), cumulativePercentage: 1.00 }
  ],
  2026: [
    { quarter: 'Q1', dueDate: 'April 15, 2026', dueDateObj: new Date('2026-04-15'), cumulativePercentage: 0.30 },
    { quarter: 'Q2', dueDate: 'June 15, 2026', dueDateObj: new Date('2026-06-15'), cumulativePercentage: 0.70 },
    { quarter: 'Q4', dueDate: 'January 15, 2027', dueDateObj: new Date('2027-01-15'), cumulativePercentage: 1.00 }
  ],
  // Jan 15, 2028 is a Saturday and Jan 17, 2028 is MLK Day, so Q4 shifts to Tuesday Jan 18, 2028
  2027: [
    { quarter: 'Q1', dueDate: 'April 15, 2027', dueDateObj: new Date('2027-04-15'), cumulativePercentage: 0.30 },
    { quarter: 'Q2', dueDate: 'June 15, 2027', dueDateObj: new Date('2027-06-15'), cumulativePercentage: 0.70 },
    { quarter: 'Q4', dueDate: 'January 18, 2028', dueDateObj: new Date('2028-01-18'), cumulativePercentage: 1.00 }
  ]
}

export function calculateCaliforniaEstimatedPayments(
  totalTaxOwed: number,
  estimatedPayments: EstimatedPaymentsData,
  taxYear: TaxYear = 2025
): EstimatedPaymentSuggestion[] {
  const schedule = CALIFORNIA_PAYMENT_SCHEDULES[taxYear]
  const paymentSchedule: QuarterlyPaymentSchedule[] = [
    { ...schedule[0], paid: parseFloat(estimatedPayments.californiaQ1) || 0 },
    { ...schedule[1], paid: parseFloat(estimatedPayments.californiaQ2) || 0 },
    { ...schedule[2], paid: parseFloat(estimatedPayments.californiaQ4) || 0 }
  ]

  return calculateEstimatedPaymentsWithCumulativeSchedule(totalTaxOwed, paymentSchedule)
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
 * California income tax actually paid during the tax year, which is what the
 * federal SALT deduction allows (cash basis): withholdings plus the Q1 and Q2
 * estimated payments. The Q4 payment is due in January of the following year,
 * so it is deductible in that later year and is excluded here.
 */
export function calculateCaliforniaTaxPaidInYear(
  withholdings: number,
  estimatedPayments: EstimatedPaymentsData
): number {
  return withholdings +
    (parseFloat(estimatedPayments.californiaQ1) || 0) +
    (parseFloat(estimatedPayments.californiaQ2) || 0)
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
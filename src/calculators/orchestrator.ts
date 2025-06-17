import { TaxYear, FilingStatus, DeductionInfo } from '../types'
import { 
  IncomeData,
  DeductionsData,
  EstimatedPaymentsData
} from '../store/useStore'
import { 
  calculateFederalTax, 
  getFederalStandardDeduction,
  calculateFederalItemizedDeductions,
  calculateFederalEstimatedPayments,
  type FederalIncomeBreakdown,
  type FederalTaxResult,
  type EstimatedPaymentSuggestion
} from './federal/calculator'
import { 
  calculateCaliforniaTax, 
  getCaliforniaStandardDeduction,
  calculateCaliforniaItemizedDeductions,
  calculateCaliforniaEstimatedPayments,
  calculateEstimatedCAStateTax,
  type CaliforniaTaxResult
} from './california/calculator'
import { aggregateHouseholdIncome } from './utils/householdIncome'

export interface TaxCalculationResult {
  // Total amounts
  totalIncome: number
  businessExpenses: number
  
  // Federal results
  federalTax: FederalTaxResult  // Contains total tax liability, breakdown, owed/refund, and effective rate
  
  // California results (optional)
  californiaTax?: CaliforniaTaxResult  // Contains total CA tax liability, breakdown, owed/refund, and effective rate
}


/**
 * Calculate comprehensive tax results based on all user input
 */
export function calculateComprehensiveTax(
  taxYear: TaxYear,
  filingStatus: FilingStatus,
  includeCaliforniaTax: boolean,
  deductions: DeductionsData,
  userIncome: IncomeData,
  spouseIncome: IncomeData,
  estimatedPayments: EstimatedPaymentsData
): TaxCalculationResult | null {
  // filingStatus is always defined now

  // Aggregate income for the entire household
  const household = aggregateHouseholdIncome(userIncome, spouseIncome, filingStatus)
  
  // Apply business expenses to reduce gross income (Schedule C)
  const businessExpenses = parseFloat(deductions.businessExpenses) || 0
  const grossIncomeAfterBusinessExpenses = household.totalIncome - businessExpenses
  
  // Calculate total income before capital loss limit
  const totalIncomeBeforeLimit = grossIncomeAfterBusinessExpenses
  
  // Use household aggregated investment income
  const totalInvestmentIncome = household.investmentIncome

  // Prepare income breakdown for federal tax calculation
  // Apply capital loss limit: Net capital losses are limited to $3,000 deduction against ordinary income
  const netCapitalGains = totalInvestmentIncome.shortTermGains + totalInvestmentIncome.longTermGains
  const capitalLossDeduction = netCapitalGains < 0 ? Math.max(netCapitalGains, -3000) : 0
  
  // Calculate total income with capital loss limit applied
  const capitalLossAdjustment = netCapitalGains < 0 ? netCapitalGains - capitalLossDeduction : 0
  const totalIncome = totalIncomeBeforeLimit - capitalLossAdjustment

  // Calculate total ordinary income components before applying business expenses
  const nonQualifiedDividends = totalInvestmentIncome.ordinaryDividends - totalInvestmentIncome.qualifiedDividends
  const ordinaryInvestmentIncome = nonQualifiedDividends + totalInvestmentIncome.interestIncome
  
  // Apply business expenses to reduce ordinary income
  let remainingBusinessExpenses = businessExpenses
  let adjustedWageIncome = household.wageIncome
  let adjustedOrdinaryInvestmentIncome = ordinaryInvestmentIncome
  
  // First apply to wage income
  if (remainingBusinessExpenses > 0 && adjustedWageIncome > 0) {
    const wageReduction = Math.min(remainingBusinessExpenses, adjustedWageIncome)
    adjustedWageIncome -= wageReduction
    remainingBusinessExpenses -= wageReduction
  }
  
  // Then apply remaining to ordinary investment income (non-qualified dividends + interest)
  if (remainingBusinessExpenses > 0 && adjustedOrdinaryInvestmentIncome > 0) {
    const investmentReduction = Math.min(remainingBusinessExpenses, adjustedOrdinaryInvestmentIncome)
    adjustedOrdinaryInvestmentIncome -= investmentReduction
    remainingBusinessExpenses -= investmentReduction
  }
  
  // Calculate adjusted components
  const adjustmentRatio = ordinaryInvestmentIncome > 0 ? adjustedOrdinaryInvestmentIncome / ordinaryInvestmentIncome : 1
  const adjustedNonQualifiedDividends = nonQualifiedDividends * adjustmentRatio
  const adjustedInterestIncome = totalInvestmentIncome.interestIncome * adjustmentRatio
  
  const federalIncomeBreakdown: FederalIncomeBreakdown = {
    ordinaryIncome: adjustedWageIncome + 
                    adjustedNonQualifiedDividends +
                    adjustedInterestIncome +
                    capitalLossDeduction, // Apply capital loss limit
    qualifiedDividends: totalInvestmentIncome.qualifiedDividends,
    longTermCapitalGains: Math.max(0, totalInvestmentIncome.longTermGains), // Only positive LTCG
    shortTermCapitalGains: Math.max(0, totalInvestmentIncome.shortTermGains), // Only positive STCG
    // Additional detail fields
    wages: adjustedWageIncome,
    interestIncome: adjustedInterestIncome,
    ordinaryDividends: totalInvestmentIncome.ordinaryDividends,
    capitalLossDeduction
  }

  // Calculate estimated CA state tax for SALT deduction if needed
  const estimatedCAStateTax = includeCaliforniaTax
    ? calculateEstimatedCAStateTax(totalIncome, filingStatus, taxYear)
    : 0

  // Calculate deductions (standard vs itemized)
  const standardDeduction = getFederalStandardDeduction(taxYear, filingStatus)
  const itemizedDeduction = calculateFederalItemizedDeductions(
    deductions, 
    estimatedCAStateTax,
    includeCaliforniaTax
  )
  
  const useItemized = itemizedDeduction > standardDeduction
  const deductionAmount = useItemized ? itemizedDeduction : standardDeduction
  
  // Create DeductionInfo object for federal tax calculation
  const federalDeductionInfo: DeductionInfo = {
    type: useItemized ? 'itemized' : 'standard',
    amount: deductionAmount
  }

  // Calculate federal withholdings and payments
  const federalWithholdings = household.totalWithholdings.federal
  const federalEstimatedPaid = calculateTotalFederalEstimatedPayments(estimatedPayments)

  // Calculate federal tax
  const federalResult = calculateFederalTax(
    federalIncomeBreakdown,
    federalDeductionInfo,
    filingStatus,
    taxYear,
    totalIncome,
    federalWithholdings,
    federalEstimatedPaid
  )

  // Initialize California results
  let californiaResult = undefined

  if (includeCaliforniaTax) {
    // Calculate California deductions
    const caStandardDeduction = getCaliforniaStandardDeduction(taxYear, filingStatus)
    const caItemizedDeduction = calculateCaliforniaItemizedDeductions(deductions)
    const caUseItemized = caItemizedDeduction > caStandardDeduction
    const caDeductionAmount = caUseItemized ? caItemizedDeduction : caStandardDeduction
    
    // Create DeductionInfo object for California tax calculation
    const caDeductionInfo: DeductionInfo = {
      type: caUseItemized ? 'itemized' : 'standard',
      amount: caDeductionAmount
    }

    // Calculate California withholdings
    const californiaWithholdings = household.totalWithholdings.state

    const californiaEstimatedPaid = calculateTotalCaliforniaEstimatedPayments(estimatedPayments)

    // Calculate California tax
    californiaResult = calculateCaliforniaTax(
      totalIncome,
      caDeductionInfo,
      filingStatus,
      taxYear,
      californiaWithholdings,
      californiaEstimatedPaid
    )

  }

  return {
    totalIncome: Math.round(totalIncome),
    businessExpenses: Math.round(businessExpenses),
    federalTax: federalResult,
    californiaTax: californiaResult
  }
}


/**
 * Calculate total federal estimated tax payments
 */
export function calculateTotalFederalEstimatedPayments(estimatedPayments: EstimatedPaymentsData): number {
  return (
    (parseFloat(estimatedPayments.federalQ1) || 0) +
    (parseFloat(estimatedPayments.federalQ2) || 0) +
    (parseFloat(estimatedPayments.federalQ3) || 0) +
    (parseFloat(estimatedPayments.federalQ4) || 0)
  )
}

/**
 * Calculate total California estimated tax payments
 */
export function calculateTotalCaliforniaEstimatedPayments(estimatedPayments: EstimatedPaymentsData): number {
  return (
    (parseFloat(estimatedPayments.californiaQ1) || 0) +
    (parseFloat(estimatedPayments.californiaQ2) || 0) +
    (parseFloat(estimatedPayments.californiaQ4) || 0)
  )
}

// Re-export functions that are used by components
export { 
  calculateFederalEstimatedPayments,
  calculateCaliforniaEstimatedPayments,
  calculateEstimatedCAStateTax,
  calculateCaliforniaItemizedDeductions,
  type EstimatedPaymentSuggestion
}
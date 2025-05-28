import { TaxYear, FilingStatus } from '../types'
import { 
  calculateFederalTax, 
  getFederalStandardDeduction,
  calculateFederalItemizedDeductions,
  calculateFederalEstimatedPayments,
  type FederalIncomeBreakdown,
  type FederalTaxResult,
  type DeductionsData,
  type EstimatedPaymentsData,
  type EstimatedPaymentSuggestion
} from './federal/calculator'
import { 
  calculateCaliforniaTax, 
  getCaliforniaStandardDeduction,
  calculateCaliforniaItemizedDeductions,
  calculateCaliforniaEstimatedPayments,
  calculateEstimatedCAStateTax,
  calculateCaliforniaWithholdings,
  type IncomeData
} from './california/calculator'
import { aggregateIndividualIncome } from './utils/income'

export interface TaxCalculationResult {
  // Total amounts
  totalIncome: number
  
  // Federal results
  federalTax: FederalTaxResult  // Contains total tax liability and breakdown (before any payments)
  federalOwedOrRefund: number    // Final amount owed (positive) or refunded (negative) after subtracting withholdings and estimated payments
  
  // California results (optional)
  californiaTax?: {
    baseTax: number
    mentalHealthTax: number
    totalTax: number             // Total CA tax liability (before any payments)
  }
  californiaOwedOrRefund?: number // Final amount owed (positive) or refunded (negative) after subtracting withholdings and estimated payments
  
  // Deduction info
  deductionType: 'standard' | 'itemized'
  deductionAmount: number
  
  // Other info
  federalEffectiveRate: number
  californiaEffectiveRate?: number
}

export interface ItemizedDeductionDetails {
  total: number
  propertyTax: number
  stateIncomeTax: number
  saltTotal: number
  saltCapApplied: boolean
  mortgageInterest: number
  mortgageInterestLimited: boolean
  mortgageBalance: number
  mortgageLimit: number
  donations: number
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

  // Aggregate income from user and spouse
  const userAgg = aggregateIndividualIncome(userIncome)
  const spouseAgg = filingStatus === 'marriedFilingJointly' 
    ? aggregateIndividualIncome(spouseIncome)
    : { 
        totalIncome: 0, 
        investmentIncome: {
          ordinaryDividends: 0, qualifiedDividends: 0, interestIncome: 0,
          shortTermGains: 0, longTermGains: 0
        },
        wageIncome: 0,
        totalWithholdings: { federal: 0, state: 0 }
      }

  // Calculate total income before capital loss limit
  const totalIncomeBeforeLimit = userAgg.totalIncome + spouseAgg.totalIncome

  // Aggregate investment income
  const totalInvestmentIncome = {
    ordinaryDividends: userAgg.investmentIncome.ordinaryDividends + spouseAgg.investmentIncome.ordinaryDividends,
    qualifiedDividends: userAgg.investmentIncome.qualifiedDividends + spouseAgg.investmentIncome.qualifiedDividends,
    interestIncome: userAgg.investmentIncome.interestIncome + spouseAgg.investmentIncome.interestIncome,
    shortTermGains: userAgg.investmentIncome.shortTermGains + spouseAgg.investmentIncome.shortTermGains,
    longTermGains: userAgg.investmentIncome.longTermGains + spouseAgg.investmentIncome.longTermGains
  }

  // Prepare income breakdown for federal tax calculation
  // Apply capital loss limit: Net capital losses are limited to $3,000 deduction against ordinary income
  const netCapitalGains = totalInvestmentIncome.shortTermGains + totalInvestmentIncome.longTermGains
  const capitalLossDeduction = netCapitalGains < 0 ? Math.max(netCapitalGains, -3000) : 0
  
  // Calculate total income with capital loss limit applied
  const capitalLossAdjustment = netCapitalGains < 0 ? netCapitalGains - capitalLossDeduction : 0
  const totalIncome = totalIncomeBeforeLimit - capitalLossAdjustment

  const federalIncomeBreakdown: FederalIncomeBreakdown = {
    ordinaryIncome: userAgg.wageIncome + spouseAgg.wageIncome + 
                    (totalInvestmentIncome.ordinaryDividends - totalInvestmentIncome.qualifiedDividends) + // Non-qualified dividends
                    totalInvestmentIncome.interestIncome +
                    capitalLossDeduction, // Apply capital loss limit
    qualifiedDividends: totalInvestmentIncome.qualifiedDividends,
    longTermCapitalGains: Math.max(0, totalInvestmentIncome.longTermGains), // Only positive LTCG
    shortTermCapitalGains: Math.max(0, totalInvestmentIncome.shortTermGains) // Only positive STCG
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

  // Calculate federal tax
  const federalResult = calculateFederalTax(
    federalIncomeBreakdown,
    deductionAmount,
    filingStatus,
    taxYear
  )

  // Calculate federal withholdings and payments
  const federalWithholdings = userAgg.totalWithholdings.federal + spouseAgg.totalWithholdings.federal
  const federalEstimatedPaid = 
    (parseFloat(estimatedPayments.federalQ1) || 0) +
    (parseFloat(estimatedPayments.federalQ2) || 0) +
    (parseFloat(estimatedPayments.federalQ3) || 0) +
    (parseFloat(estimatedPayments.federalQ4) || 0)

  // Calculate final amount owed or refunded
  // Positive = still owe taxes, Negative = getting a refund
  const federalOwedOrRefund = federalResult.totalTax - federalWithholdings - federalEstimatedPaid

  // Initialize California results
  let californiaResult = undefined
  let californiaOwedOrRefund = undefined
  let californiaEffectiveRate = undefined

  if (includeCaliforniaTax) {
    // Calculate California deductions
    const caStandardDeduction = getCaliforniaStandardDeduction(taxYear, filingStatus)
    const caItemizedDeduction = calculateCaliforniaItemizedDeductions(deductions)
    const caDeductionAmount = Math.max(caStandardDeduction, caItemizedDeduction)

    // Calculate California tax
    californiaResult = calculateCaliforniaTax(
      totalIncome,
      caDeductionAmount,
      filingStatus,
      taxYear
    )

    // Calculate California withholdings
    const californiaWithholdings = calculateCaliforniaWithholdings(
      userAgg.totalWithholdings,
      filingStatus === 'marriedFilingJointly' ? spouseAgg.totalWithholdings : null
    )

    const californiaEstimatedPaid = 
      (parseFloat(estimatedPayments.californiaQ1) || 0) +
      (parseFloat(estimatedPayments.californiaQ2) || 0) +
      (parseFloat(estimatedPayments.californiaQ4) || 0)

    // Calculate final CA amount owed or refunded (same logic as federal)
    californiaOwedOrRefund = californiaResult.totalTax - californiaWithholdings - californiaEstimatedPaid
    californiaEffectiveRate = totalIncome > 0 ? (californiaResult.totalTax / totalIncome) * 100 : 0
  }

  return {
    totalIncome: Math.round(totalIncome),
    federalTax: federalResult,
    federalOwedOrRefund: Math.round(federalOwedOrRefund),
    californiaTax: californiaResult,
    californiaOwedOrRefund: californiaOwedOrRefund !== undefined ? Math.round(californiaOwedOrRefund) : undefined,
    deductionType: useItemized ? 'itemized' : 'standard',
    deductionAmount: Math.round(deductionAmount),
    federalEffectiveRate: totalIncome > 0 ? (federalResult.totalTax / totalIncome) * 100 : 0,
    californiaEffectiveRate
  }
}

/**
 * Calculate federal itemized deduction details with all components
 */
export function calculateFederalItemizedDeductionDetails(
  deductions: DeductionsData,
  estimatedCAStateTax: number,
  includeCaliforniaTax: boolean
): ItemizedDeductionDetails {
  const propertyTax = parseFloat(deductions.propertyTax) || 0
  const mortgageInterest = parseFloat(deductions.mortgageInterest) || 0
  const donations = parseFloat(deductions.donations) || 0
  const mortgageBalance = parseFloat(deductions.mortgageBalance) || 0
  
  // Calculate state income tax for SALT
  const stateIncomeTax = includeCaliforniaTax 
    ? estimatedCAStateTax
    : parseFloat(deductions.otherStateIncomeTax) || 0
  
  // SALT components
  const saltTotal = propertyTax + stateIncomeTax
  const saltCapApplied = saltTotal > 10000
  const saltDeduction = Math.min(saltTotal, 10000)
  
  // Calculate mortgage interest deduction with limits
  let deductibleMortgageInterest = mortgageInterest
  let mortgageInterestLimited = false
  let mortgageLimit = 0
  
  if (mortgageBalance > 0 && deductions.mortgageLoanDate) {
    mortgageLimit = deductions.mortgageLoanDate === 'before-dec-16-2017' ? 1000000 : 750000
    if (mortgageBalance > mortgageLimit) {
      deductibleMortgageInterest = mortgageInterest * (mortgageLimit / mortgageBalance)
      mortgageInterestLimited = true
    }
  }
  
  return {
    total: saltDeduction + deductibleMortgageInterest + donations,
    propertyTax,
    stateIncomeTax,
    saltTotal,
    saltCapApplied,
    mortgageInterest: deductibleMortgageInterest,
    mortgageInterestLimited,
    mortgageBalance,
    mortgageLimit,
    donations
  }
}

// Re-export functions that are used by components
export { 
  calculateFederalEstimatedPayments,
  calculateCaliforniaEstimatedPayments,
  calculateCaliforniaWithholdings,
  calculateEstimatedCAStateTax,
  calculateCaliforniaItemizedDeductions,
  type EstimatedPaymentSuggestion
}
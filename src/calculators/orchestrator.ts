import { TaxYear, FilingStatus, DeductionInfo } from '../types'
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
  type IncomeData,
  type CaliforniaTaxResult
} from './california/calculator'
import { aggregateIndividualIncome } from './utils/income'

export interface TaxCalculationResult {
  // Total amounts
  totalIncome: number
  
  // Federal results
  federalTax: FederalTaxResult  // Contains total tax liability, breakdown, owed/refund, and effective rate
  
  // California results (optional)
  californiaTax?: CaliforniaTaxResult  // Contains total CA tax liability, breakdown, owed/refund, and effective rate
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
  
  // Create DeductionInfo object for federal tax calculation
  const federalDeductionInfo: DeductionInfo = {
    type: useItemized ? 'itemized' : 'standard',
    amount: deductionAmount
  }

  // Calculate federal withholdings and payments
  const federalWithholdings = userAgg.totalWithholdings.federal + spouseAgg.totalWithholdings.federal
  const federalEstimatedPaid = 
    (parseFloat(estimatedPayments.federalQ1) || 0) +
    (parseFloat(estimatedPayments.federalQ2) || 0) +
    (parseFloat(estimatedPayments.federalQ3) || 0) +
    (parseFloat(estimatedPayments.federalQ4) || 0)

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
    const californiaWithholdings = calculateCaliforniaWithholdings(
      userAgg.totalWithholdings,
      filingStatus === 'marriedFilingJointly' ? spouseAgg.totalWithholdings : null
    )

    const californiaEstimatedPaid = 
      (parseFloat(estimatedPayments.californiaQ1) || 0) +
      (parseFloat(estimatedPayments.californiaQ2) || 0) +
      (parseFloat(estimatedPayments.californiaQ4) || 0)

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
    federalTax: federalResult,
    californiaTax: californiaResult
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
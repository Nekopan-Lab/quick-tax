import { TaxYear, FilingStatus, DeductionInfo } from '../types'
import { 
  IncomeData,
  DeductionsData,
  EstimatedPaymentsData
} from '../store/useStore'
import { 
  calculateFederalTax, 
  getFederalStandardDeduction,
  calculateFederalItemizedDeductionDetails,
  calculateFederalEstimatedPayments,
  calculateNonItemizerCharitableDeduction,
  type FederalIncomeBreakdown,
  type FederalTaxResult,
  type FederalItemizedDeductionDetails,
  type EstimatedPaymentSuggestion
} from './federal/calculator'
import { getFederalSaltCap } from './federal/constants'
import { 
  calculateCaliforniaTax, 
  getCaliforniaStandardDeduction,
  calculateCaliforniaItemizedDeductions,
  calculateCaliforniaItemizedDeductionDetails,
  calculateCaliforniaEstimatedPayments,
  calculateCaliforniaTaxPaidInYear,
  calculateEstimatedCAStateTax,
  type CaliforniaTaxResult,
  type CaliforniaItemizedDeductionDetails
} from './california/calculator'
import { aggregateHouseholdIncome } from './utils/householdIncome'

export interface FederalDeductionSummary {
  standardDeduction: number
  nonItemizerCharitable: number   // OBBBA charitable deduction added to the standard deduction (2026+)
  itemized: FederalItemizedDeductionDetails
  saltCap: number                 // Effective SALT cap after MAGI phaseout
  useItemized: boolean
  amount: number                  // Deduction used in the federal calculation
}

export interface CaliforniaDeductionSummary {
  standardDeduction: number
  itemized: CaliforniaItemizedDeductionDetails
  useItemized: boolean
  amount: number
}

export interface TaxCalculationResult {
  // Total amounts
  totalIncome: number             // AGI
  businessExpenses: number
  netInvestmentIncome: number

  // Deduction choice and breakdowns (single source of truth for the UI)
  deductions: {
    federal: FederalDeductionSummary
    california?: CaliforniaDeductionSummary
  }
  
  // Federal results
  federalTax: FederalTaxResult  // Contains total tax liability, breakdown, owed/refund, and effective rate
  
  // California results (optional)
  californiaTax?: CaliforniaTaxResult  // Contains total CA tax liability, breakdown, owed/refund, and effective rate
}

/**
 * Net short-term and long-term capital gains the way Schedule D does:
 * a loss in one holding period offsets a gain in the other, and a net loss
 * is deductible against ordinary income up to $3,000.
 */
export function netCapitalGains(shortTerm: number, longTerm: number): {
  shortTermGain: number      // Taxable short-term gain after netting (>= 0)
  longTermGain: number       // Taxable long-term gain after netting (>= 0)
  lossDeduction: number      // Net capital loss allowed against ordinary income (<= 0, >= -3000)
  disallowedLoss: number     // Net loss above $3,000 (carried forward; <= 0)
} {
  const net = shortTerm + longTerm
  if (net < 0) {
    const lossDeduction = Math.max(net, -3000)
    return { shortTermGain: 0, longTermGain: 0, lossDeduction, disallowedLoss: net - lossDeduction }
  }
  if (shortTerm < 0) {
    return { shortTermGain: 0, longTermGain: net, lossDeduction: 0, disallowedLoss: 0 }
  }
  if (longTerm < 0) {
    return { shortTermGain: net, longTermGain: 0, lossDeduction: 0, disallowedLoss: 0 }
  }
  return { shortTermGain: shortTerm, longTermGain: longTerm, lossDeduction: 0, disallowedLoss: 0 }
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
  // Aggregate income for the entire household (paychecks limited to the selected tax year)
  const household = aggregateHouseholdIncome(userIncome, spouseIncome, filingStatus, taxYear)
  
  // Apply business expenses to reduce gross income (Schedule C)
  const businessExpenses = parseFloat(deductions.businessExpenses) || 0
  const grossIncomeAfterBusinessExpenses = household.totalIncome - businessExpenses
  
  // Use household aggregated investment income
  const totalInvestmentIncome = household.investmentIncome

  // Net short- and long-term gains, then apply the $3,000 capital loss limit
  const capitalGains = netCapitalGains(totalInvestmentIncome.shortTermGains, totalInvestmentIncome.longTermGains)
  const capitalLossDeduction = capitalGains.lossDeduction
  
  // AGI: household income already includes raw gains/losses; remove the disallowed part of a net loss
  const totalIncome = grossIncomeAfterBusinessExpenses - capitalGains.disallowedLoss

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
                    household.rothConversion +
                    capitalLossDeduction, // Apply capital loss limit
    qualifiedDividends: totalInvestmentIncome.qualifiedDividends,
    longTermCapitalGains: capitalGains.longTermGain,
    shortTermCapitalGains: capitalGains.shortTermGain,
    // Additional detail fields
    wages: adjustedWageIncome,
    interestIncome: adjustedInterestIncome,
    ordinaryDividends: totalInvestmentIncome.ordinaryDividends,
    capitalLossDeduction,
    rothConversion: household.rothConversion
  }

  // Net investment income for NIIT: interest, dividends and net capital gain (an allowed net loss reduces it)
  const netInvestmentIncome = Math.max(
    0,
    totalInvestmentIncome.interestIncome +
      totalInvestmentIncome.ordinaryDividends +
      capitalGains.shortTermGain +
      capitalGains.longTermGain +
      capitalLossDeduction
  )

  // California income tax paid during the year (deductible under federal SALT)
  const californiaWithholdings = household.totalWithholdings.state
  const caStateTaxPaid = includeCaliforniaTax
    ? calculateCaliforniaTaxPaidInYear(californiaWithholdings, estimatedPayments)
    : 0

  // Federal deductions (standard vs itemized). MAGI = AGI for this calculator.
  const standardDeduction = getFederalStandardDeduction(taxYear, filingStatus)
  const donations = parseFloat(deductions.donations) || 0
  const nonItemizerCharitable = calculateNonItemizerCharitableDeduction(donations, filingStatus, taxYear)
  const federalItemizedDetails = calculateFederalItemizedDeductionDetails(
    deductions,
    caStateTaxPaid,
    includeCaliforniaTax,
    taxYear,
    totalIncome,  // MAGI for SALT cap phaseout
    filingStatus,
    totalIncome   // AGI for the charitable floor and itemized limitation
  )
  const standardTotal = standardDeduction + nonItemizerCharitable
  const useItemized = federalItemizedDetails.total > standardTotal
  const deductionAmount = useItemized ? federalItemizedDetails.total : standardTotal
  
  // Create DeductionInfo object for federal tax calculation
  const federalDeductionInfo: DeductionInfo = {
    type: useItemized ? 'itemized' : 'standard',
    amount: deductionAmount
  }

  // Calculate federal withholdings and payments
  const federalWithholdings = household.totalWithholdings.federal
  const federalEstimatedPaid = calculateTotalFederalEstimatedPayments(estimatedPayments)

  // Calculate federal tax (including NIIT and Additional Medicare Tax)
  const federalResult = calculateFederalTax(
    federalIncomeBreakdown,
    federalDeductionInfo,
    filingStatus,
    taxYear,
    totalIncome,
    federalWithholdings,
    federalEstimatedPaid,
    {
      magi: totalIncome,
      netInvestmentIncome,
      wagesByPerson: household.wageIncomeByPerson
    }
  )

  const federalDeductionSummary: FederalDeductionSummary = {
    standardDeduction,
    nonItemizerCharitable,
    itemized: federalItemizedDetails,
    saltCap: getFederalSaltCap(taxYear, totalIncome),
    useItemized,
    amount: deductionAmount
  }

  // Initialize California results
  let californiaResult = undefined
  let californiaDeductionSummary: CaliforniaDeductionSummary | undefined = undefined

  if (includeCaliforniaTax) {
    // Calculate California deductions (with high-AGI itemized limitation)
    const caStandardDeduction = getCaliforniaStandardDeduction(taxYear, filingStatus)
    const caItemizedDetails = calculateCaliforniaItemizedDeductionDetails(deductions, totalIncome, filingStatus, taxYear)
    const caUseItemized = caItemizedDetails.total > caStandardDeduction
    const caDeductionAmount = caUseItemized ? caItemizedDetails.total : caStandardDeduction
    
    // Create DeductionInfo object for California tax calculation
    const caDeductionInfo: DeductionInfo = {
      type: caUseItemized ? 'itemized' : 'standard',
      amount: caDeductionAmount
    }

    const californiaEstimatedPaid = calculateTotalCaliforniaEstimatedPayments(estimatedPayments)

    // Calculate California tax (exemption credit phases out on federal AGI)
    californiaResult = calculateCaliforniaTax(
      totalIncome,
      caDeductionInfo,
      filingStatus,
      taxYear,
      californiaWithholdings,
      californiaEstimatedPaid,
      totalIncome
    )

    californiaDeductionSummary = {
      standardDeduction: caStandardDeduction,
      itemized: caItemizedDetails,
      useItemized: caUseItemized,
      amount: caDeductionAmount
    }
  }

  return {
    totalIncome: Math.round(totalIncome),
    businessExpenses: Math.round(businessExpenses),
    netInvestmentIncome: Math.round(netInvestmentIncome),
    deductions: {
      federal: federalDeductionSummary,
      california: californiaDeductionSummary
    },
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
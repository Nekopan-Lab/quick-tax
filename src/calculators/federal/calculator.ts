import { FilingStatus, DeductionInfo } from '@/types'
import { DeductionsData, EstimatedPaymentsData } from '@/store/useStore'
import {
  TaxYear,
  getFederalTaxBrackets,
  getFederalStandardDeduction,
  getFederalCapitalGainsBrackets,
  getFederalSaltCap,
  getFederalDeductionRules,
  getFederalTopBracketThreshold,
  NIIT_RATE,
  NIIT_THRESHOLDS,
  ADDITIONAL_MEDICARE_RATE,
  ADDITIONAL_MEDICARE_THRESHOLDS,
  ADDITIONAL_MEDICARE_EMPLOYER_WITHHOLDING_THRESHOLD
} from './constants'
import { calculateProgressiveTaxWithDetails, TaxBracketDetail, calculateDistanceToNextBracket, NextBracketInfo } from '../utils/taxBrackets'
import { calculateEstimatedPaymentsWithCumulativeSchedule, type QuarterlyPaymentSchedule } from '../utils/estimatedPayments'

export interface FederalIncomeBreakdown {
  ordinaryIncome: number
  qualifiedDividends: number
  longTermCapitalGains: number
  shortTermCapitalGains: number
  // Additional detail for income components
  wages: number
  interestIncome: number
  ordinaryDividends: number
  capitalLossDeduction: number
  rothConversion: number
}

export interface FederalIncomeComponents {
  wages: number
  nonQualifiedDividends: number
  interestIncome: number
  shortTermGains: number
  longTermGains: number
  qualifiedDividends: number
  capitalLossDeduction: number
  rothConversion: number
  totalOrdinaryIncome: number
  ordinaryTaxableIncome: number
}

/** Inputs for the surtaxes that sit on top of regular income tax */
export interface FederalSurtaxInputs {
  magi: number                  // Modified AGI (NIIT threshold test)
  netInvestmentIncome: number   // Interest, dividends and net capital gains
  wagesByPerson: number[]       // W-2 wages per earner (Additional Medicare Tax)
}

export interface FederalTaxResult {
  taxableIncome: number        // Income after deductions
  ordinaryIncomeTax: number    // Tax on wages, interest, non-qualified dividends, short-term gains
  capitalGainsTax: number      // Tax on qualified dividends and long-term capital gains
  netInvestmentIncomeTax: number   // 3.8% NIIT
  additionalMedicareTax: number    // 0.9% Additional Medicare Tax on wages
  additionalMedicareWithheld: number // Additional Medicare Tax employers withhold (wages over $200k per earner)
  withholdings: number         // Total federal withholdings credited (income tax withholding + Additional Medicare withheld)
  totalTax: number             // Total tax liability (before any withholdings or payments)
  deduction: DeductionInfo     // Deduction type and amount used for federal tax calculation
  owedOrRefund: number         // Final amount owed (positive) or refunded (negative) after subtracting withholdings and estimated payments
  effectiveRate: number        // Effective tax rate as percentage
  incomeComponents: FederalIncomeComponents  // Breakdown of income components
  ordinaryTaxBrackets: TaxBracketDetail[]    // Detailed bracket calculations for ordinary income
  capitalGainsBrackets: TaxBracketDetail[]   // Detailed bracket calculations for capital gains
  nextBracketInfo: NextBracketInfo           // Distance to next tax bracket
}

/**
 * Calculate federal income tax based on income breakdown and deductions
 * @param income - Breakdown of different income types
 * @param deductionInfo - Deduction type and amount
 * @param filingStatus - Filing status (single or marriedFilingJointly)
 * @param taxYear - Tax year for calculations
 * @param totalIncome - Total income for effective rate calculation
 * @param withholdings - Total federal withholdings
 * @param estimatedPayments - Total estimated payments made
 * @param surtaxInputs - Optional inputs for NIIT and Additional Medicare Tax (omitted = no surtaxes)
 * @returns Federal tax calculation result
 */
export function calculateFederalTax(
  income: FederalIncomeBreakdown,
  deductionInfo: DeductionInfo,
  filingStatus: FilingStatus,
  taxYear: TaxYear,
  totalIncome: number,
  withholdings: number,
  estimatedPayments: number,
  surtaxInputs?: FederalSurtaxInputs
): FederalTaxResult {
  // Calculate component income total (for internal calculations)
  const componentIncome = 
    income.ordinaryIncome + 
    income.qualifiedDividends + 
    income.longTermCapitalGains + 
    income.shortTermCapitalGains

  // Calculate taxable income after deductions
  const taxableIncome = Math.max(0, componentIncome - deductionInfo.amount)

  // Short-term capital gains are taxed as ordinary income
  const ordinaryIncomeForTax = income.ordinaryIncome + income.shortTermCapitalGains
  
  // Calculate ordinary taxable income (excluding qualified dividends and LTCG)
  const ordinaryTaxableIncome = Math.max(0, ordinaryIncomeForTax - deductionInfo.amount)
  
  // Calculate tax on ordinary income with bracket details
  const ordinaryTaxResult = calculateProgressiveTaxWithDetails(
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
  const capitalGainsBrackets: TaxBracketDetail[] = []
  
  if (taxableCapitalGainsAndDividends > 0) {
    const brackets = getFederalCapitalGainsBrackets(taxYear, filingStatus)
    let remainingCapGains = taxableCapitalGainsAndDividends
    let currentIncome = ordinaryTaxableIncome // Start from where ordinary income ends
    
    for (const bracket of brackets) {
      if (remainingCapGains <= 0) break
      
      // Calculate how much room we have in this bracket
      const roomInBracket = Math.max(0, bracket.max - currentIncome)
      const taxableInThisBracket = Math.min(remainingCapGains, roomInBracket)
      
      if (taxableInThisBracket > 0) {
        const taxForBracket = taxableInThisBracket * bracket.rate
        capitalGainsTax += taxForBracket
        
        capitalGainsBrackets.push({
          bracket: { min: bracket.min, max: bracket.max, rate: bracket.rate },
          taxableInBracket: taxableInThisBracket,
          taxForBracket: Math.round(taxForBracket)
        })
      }
      
      remainingCapGains -= taxableInThisBracket
      currentIncome += taxableInThisBracket
    }
  }

  const netInvestmentIncomeTax = surtaxInputs
    ? calculateNetInvestmentIncomeTax(surtaxInputs.netInvestmentIncome, surtaxInputs.magi, filingStatus)
    : 0
  const medicare = surtaxInputs
    ? calculateAdditionalMedicareTax(surtaxInputs.wagesByPerson, filingStatus)
    : { tax: 0, withheld: 0 }

  const totalTax = Math.round(ordinaryTaxResult.totalTax + capitalGainsTax + netInvestmentIncomeTax + medicare.tax)
  const totalWithholdings = withholdings + medicare.withheld
  const owedOrRefund = totalTax - totalWithholdings - estimatedPayments
  const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0
  
  // Compute income components using the detailed breakdown
  const nonQualifiedDividends = income.ordinaryDividends - income.qualifiedDividends
  
  const incomeComponents: FederalIncomeComponents = {
    wages: income.wages,
    nonQualifiedDividends,
    interestIncome: income.interestIncome,
    shortTermGains: income.shortTermCapitalGains,
    longTermGains: income.longTermCapitalGains,
    qualifiedDividends: income.qualifiedDividends,
    capitalLossDeduction: income.capitalLossDeduction,
    rothConversion: income.rothConversion,
    totalOrdinaryIncome: income.ordinaryIncome + income.shortTermCapitalGains,
    ordinaryTaxableIncome
  }

  // Calculate distance to next bracket based on ordinary taxable income
  const nextBracketInfo = calculateDistanceToNextBracket(
    ordinaryTaxableIncome,
    getFederalTaxBrackets(taxYear, filingStatus)
  )

  return {
    taxableIncome,
    ordinaryIncomeTax: Math.round(ordinaryTaxResult.totalTax),
    capitalGainsTax: Math.round(capitalGainsTax),
    netInvestmentIncomeTax: Math.round(netInvestmentIncomeTax),
    additionalMedicareTax: Math.round(medicare.tax),
    additionalMedicareWithheld: Math.round(medicare.withheld),
    withholdings: Math.round(totalWithholdings),
    totalTax,
    deduction: deductionInfo,
    owedOrRefund: Math.round(owedOrRefund),
    effectiveRate,
    incomeComponents,
    ordinaryTaxBrackets: ordinaryTaxResult.bracketDetails,
    capitalGainsBrackets,
    nextBracketInfo
  }
}

/**
 * Net Investment Income Tax: 3.8% of the lesser of net investment income
 * or MAGI above the filing-status threshold ($200k single / $250k MFJ)
 */
export function calculateNetInvestmentIncomeTax(
  netInvestmentIncome: number,
  magi: number,
  filingStatus: FilingStatus
): number {
  const excessMagi = Math.max(0, magi - NIIT_THRESHOLDS[filingStatus])
  const base = Math.min(Math.max(0, netInvestmentIncome), excessMagi)
  return base * NIIT_RATE
}

/**
 * Additional Medicare Tax: 0.9% of combined wages above the filing-status threshold.
 * Employers withhold 0.9% on each earner's wages above $200k regardless of filing status;
 * that withholding is credited against the tax.
 */
export function calculateAdditionalMedicareTax(
  wagesByPerson: number[],
  filingStatus: FilingStatus
): { tax: number; withheld: number } {
  const totalWages = wagesByPerson.reduce((sum, w) => sum + Math.max(0, w), 0)
  const tax = Math.max(0, totalWages - ADDITIONAL_MEDICARE_THRESHOLDS[filingStatus]) * ADDITIONAL_MEDICARE_RATE
  const withheld = wagesByPerson.reduce(
    (sum, w) => sum + Math.max(0, w - ADDITIONAL_MEDICARE_EMPLOYER_WITHHOLDING_THRESHOLD) * ADDITIONAL_MEDICARE_RATE,
    0
  )
  return { tax, withheld }
}

/**
 * OBBBA (2026+) limitation on itemized deductions for 37%-bracket taxpayers:
 * reduce itemized deductions by 2/37 of the lesser of (a) itemized deductions or
 * (b) taxable income (before this limitation, plus itemized deductions) above the 37% threshold.
 * incomeBeforeItemized is AGI (taxable income + itemized deductions when there are no other deductions).
 */
export function calculateFederalItemizedLimitation(
  itemizedTotal: number,
  incomeBeforeItemized: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear
): number {
  const rate = getFederalDeductionRules(taxYear).itemizedLimitationRate
  if (rate === 0 || itemizedTotal <= 0) return 0
  const excess = Math.max(0, incomeBeforeItemized - getFederalTopBracketThreshold(taxYear, filingStatus))
  return Math.min(itemizedTotal, excess) * rate
}

/** OBBBA (2026+) charitable deduction for taxpayers who take the standard deduction */
export function calculateNonItemizerCharitableDeduction(
  donations: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear
): number {
  const cap = getFederalDeductionRules(taxYear).nonItemizerCharitableCap[filingStatus]
  return Math.min(Math.max(0, donations), cap)
}

// Re-export the helper function for backwards compatibility
export { getFederalStandardDeduction }

export interface EstimatedPaymentSuggestion {
  quarter: string
  dueDate: string
  amount: number
  isPaid: boolean
  isPastDue: boolean
}

export interface FederalItemizedDeductionDetails {
  propertyTax: number
  stateIncomeTax: number
  saltDeduction: number
  saltCapped: boolean
  mortgageInterest: number
  mortgageBalance: number
  mortgageLimit: number
  effectiveMortgageInterest: number
  mortgageLimited: boolean
  donations: number
  charitableFloor: number        // OBBBA 0.5%-of-AGI floor on itemized donations (2026+)
  deductibleDonations: number    // Donations after the floor
  totalBeforeLimitation: number  // SALT + mortgage interest + deductible donations
  limitationReduction: number    // OBBBA 2/37 itemized limitation for 37%-bracket taxpayers (2026+)
  total: number                  // Itemized deductions after all limits
}

/**
 * Calculate federal itemized deductions with SALT cap and mortgage interest limits
 */
export function calculateFederalItemizedDeductions(
  deductions: DeductionsData,
  estimatedCAStateTax: number,
  includeCaliforniaTax: boolean,
  taxYear: TaxYear,
  magi: number,
  filingStatus?: FilingStatus,
  agi: number = magi
): number {
  const details = calculateFederalItemizedDeductionDetails(
    deductions,
    estimatedCAStateTax,
    includeCaliforniaTax,
    taxYear,
    magi,
    filingStatus,
    agi
  )
  return details.total
}

/**
 * Calculate federal itemized deductions with detailed breakdown
 * For 2025: SALT cap is fixed at $10,000
 * For 2026: SALT cap is $40,400 with income-based phaseout starting at $505,000 MAGI
 * For 2027: SALT cap is $40,804 with income-based phaseout starting at $510,050 MAGI
 * For 2026+: donations are deductible only above 0.5% of AGI, and when filingStatus is
 * given the 2/37 limitation for 37%-bracket taxpayers is applied
 * @param caStateTaxPaid - California income tax paid during the year (used when includeCaliforniaTax)
 */
export function calculateFederalItemizedDeductionDetails(
  deductions: DeductionsData,
  caStateTaxPaid: number,
  includeCaliforniaTax: boolean,
  taxYear: TaxYear,
  magi: number,
  filingStatus?: FilingStatus,
  agi: number = magi
): FederalItemizedDeductionDetails {
  const propertyTax = parseFloat(deductions.propertyTax) || 0
  const mortgageInterest = parseFloat(deductions.mortgageInterest) || 0
  const donations = parseFloat(deductions.donations) || 0
  const mortgageBalance = parseFloat(deductions.mortgageBalance) || 0

  // Calculate state income tax for SALT
  const stateIncomeTax = includeCaliforniaTax
    ? caStateTaxPaid
    : parseFloat(deductions.otherStateIncomeTax) || 0

  // Apply SALT cap based on tax year and MAGI
  // For 2025: $10,000 cap (no phaseout)
  // For 2026: $40,400 cap with phaseout at $505,000 MAGI
  // For 2027: $40,804 cap with phaseout at $510,050 MAGI
  const saltCap = getFederalSaltCap(taxYear, magi)
  const saltTotal = propertyTax + stateIncomeTax
  const saltDeduction = Math.min(saltTotal, saltCap)
  const saltCapped = saltTotal > saltCap
  
  // Calculate mortgage interest deduction with limits
  let deductibleMortgageInterest = mortgageInterest
  let mortgageLimit = 0
  let mortgageLimited = false
  
  if (mortgageBalance > 0 && deductions.mortgageLoanDate) {
    mortgageLimit = deductions.mortgageLoanDate === 'before-dec-16-2017' ? 1000000 : 750000
    if (mortgageBalance > mortgageLimit) {
      deductibleMortgageInterest = mortgageInterest * (mortgageLimit / mortgageBalance)
      mortgageLimited = true
    }
  }
  
  // OBBBA (2026+): itemized charitable deductions only above 0.5% of AGI
  const charitableFloor = Math.min(donations, Math.max(0, agi) * getFederalDeductionRules(taxYear).charitableAgiFloorRate)
  const deductibleDonations = donations - charitableFloor

  const totalBeforeLimitation = saltDeduction + deductibleMortgageInterest + deductibleDonations
  const limitationReduction = filingStatus
    ? calculateFederalItemizedLimitation(totalBeforeLimitation, agi, filingStatus, taxYear)
    : 0

  return {
    propertyTax,
    stateIncomeTax,
    saltDeduction,
    saltCapped,
    mortgageInterest,
    mortgageBalance,
    mortgageLimit,
    effectiveMortgageInterest: deductibleMortgageInterest,
    mortgageLimited,
    donations,
    charitableFloor,
    deductibleDonations,
    totalBeforeLimitation,
    limitationReduction,
    total: totalBeforeLimitation - limitationReduction
  }
}

/**
 * Calculate suggested federal estimated tax payments
 * Federal requires cumulative payments: Q1: 25%, Q2: 50%, Q3: 75%, Q4: 100%
 */
export const FEDERAL_PAYMENT_SCHEDULES: Record<TaxYear, { quarter: string; dueDate: string; dueDateObj: Date; cumulativePercentage: number }[]> = {
  2025: [
    { quarter: 'Q1', dueDate: 'April 15, 2025', dueDateObj: new Date('2025-04-15'), cumulativePercentage: 0.25 },
    { quarter: 'Q2', dueDate: 'June 16, 2025', dueDateObj: new Date('2025-06-16'), cumulativePercentage: 0.50 },
    { quarter: 'Q3', dueDate: 'September 15, 2025', dueDateObj: new Date('2025-09-15'), cumulativePercentage: 0.75 },
    { quarter: 'Q4', dueDate: 'January 15, 2026', dueDateObj: new Date('2026-01-15'), cumulativePercentage: 1.00 }
  ],
  2026: [
    { quarter: 'Q1', dueDate: 'April 15, 2026', dueDateObj: new Date('2026-04-15'), cumulativePercentage: 0.25 },
    { quarter: 'Q2', dueDate: 'June 15, 2026', dueDateObj: new Date('2026-06-15'), cumulativePercentage: 0.50 },
    { quarter: 'Q3', dueDate: 'September 15, 2026', dueDateObj: new Date('2026-09-15'), cumulativePercentage: 0.75 },
    { quarter: 'Q4', dueDate: 'January 15, 2027', dueDateObj: new Date('2027-01-15'), cumulativePercentage: 1.00 }
  ],
  // Jan 15, 2028 is a Saturday and Jan 17, 2028 is MLK Day, so Q4 shifts to Tuesday Jan 18, 2028
  2027: [
    { quarter: 'Q1', dueDate: 'April 15, 2027', dueDateObj: new Date('2027-04-15'), cumulativePercentage: 0.25 },
    { quarter: 'Q2', dueDate: 'June 15, 2027', dueDateObj: new Date('2027-06-15'), cumulativePercentage: 0.50 },
    { quarter: 'Q3', dueDate: 'September 15, 2027', dueDateObj: new Date('2027-09-15'), cumulativePercentage: 0.75 },
    { quarter: 'Q4', dueDate: 'January 18, 2028', dueDateObj: new Date('2028-01-18'), cumulativePercentage: 1.00 }
  ]
}

export function calculateFederalEstimatedPayments(
  totalTaxOwed: number,
  estimatedPayments: EstimatedPaymentsData,
  taxYear: TaxYear = 2025
): EstimatedPaymentSuggestion[] {
  const schedule = FEDERAL_PAYMENT_SCHEDULES[taxYear]
  const paymentSchedule: QuarterlyPaymentSchedule[] = [
    { ...schedule[0], paid: parseFloat(estimatedPayments.federalQ1) || 0 },
    { ...schedule[1], paid: parseFloat(estimatedPayments.federalQ2) || 0 },
    { ...schedule[2], paid: parseFloat(estimatedPayments.federalQ3) || 0 },
    { ...schedule[3], paid: parseFloat(estimatedPayments.federalQ4) || 0 }
  ]

  return calculateEstimatedPaymentsWithCumulativeSchedule(totalTaxOwed, paymentSchedule)
}
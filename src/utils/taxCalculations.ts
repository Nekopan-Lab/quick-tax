import { calculateFederalTax, getFederalStandardDeduction } from '../calculators/federal/calculator'
import { calculateCaliforniaTax, getCaliforniaStandardDeduction } from '../calculators/california/calculator'
import { TaxYear, FilingStatus } from '../types'

// Define interfaces for the store data
interface IncomeData {
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

interface DeductionsData {
  propertyTax: string
  mortgageInterest: string
  donations: string
  mortgageLoanDate: 'before-dec-16-2017' | 'after-dec-15-2017' | ''
  mortgageBalance: string
  otherStateIncomeTax: string
}

interface EstimatedPaymentsData {
  federalQ1: string
  federalQ2: string
  federalQ3: string
  federalQ4: string
  californiaQ1: string
  californiaQ2: string
  californiaQ4: string
}

export interface TaxCalculationResult {
  totalIncome: number
  adjustedGrossIncome: number
  deductionAmount: number
  deductionType: 'standard' | 'itemized'
  taxableIncome: number
  federalTax: {
    ordinaryIncomeTax: number
    capitalGainsTax: number
    totalTax: number
  }
  californiaTax?: {
    baseTax: number
    mentalHealthTax: number
    totalTax: number
  }
  totalWithholdings: number
  totalEstimatedPayments: number
  taxOwedOrRefund: number // negative = refund, positive = owed
  federalOwedOrRefund: number
  californiaOwedOrRefund?: number
}

/**
 * Calculate total future income based on user's selected mode
 */
function calculateFutureIncome(income: IncomeData): {
  totalWage: number
  totalFederalWithhold: number
  totalStateWithhold: number
} {
  if (income.incomeMode === 'simple') {
    return {
      totalWage: parseFloat(income.futureWage) || 0,
      totalFederalWithhold: parseFloat(income.futureFederalWithhold) || 0,
      totalStateWithhold: parseFloat(income.futureStateWithhold) || 0
    }
  }

  // Detailed mode calculation
  const paycheckAmount = parseFloat(income.paycheckWage) || 0
  const paycheckFederal = parseFloat(income.paycheckFederal) || 0
  const paycheckState = parseFloat(income.paycheckState) || 0
  
  // Calculate remaining paychecks for the year (simplified - could be more sophisticated)
  const currentDate = new Date()
  const yearEnd = new Date(currentDate.getFullYear(), 11, 31)
  const weeksRemaining = Math.max(0, Math.ceil((yearEnd.getTime() - currentDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
  
  const paychecksRemaining = income.payFrequency === 'biweekly' 
    ? Math.ceil(weeksRemaining / 2) 
    : Math.ceil(weeksRemaining / 4.33) // Approximate weeks per month

  const paycheckTotal = {
    wage: paycheckAmount * paychecksRemaining,
    federal: paycheckFederal * paychecksRemaining,
    state: paycheckState * paychecksRemaining
  }

  // Add RSU vests
  const rsuTotals = income.futureRSUVests.reduce((acc, vest) => {
    const shares = parseFloat(vest.shares) || 0
    const price = parseFloat(vest.expectedPrice) || 0
    const vestValue = shares * price
    
    // Estimate withholdings based on most recent RSU vest data if available
    const rsuVestWage = parseFloat(income.rsuVestWage) || 0
    const rsuVestFederal = parseFloat(income.rsuVestFederal) || 0
    const rsuVestState = parseFloat(income.rsuVestState) || 0
    
    if (rsuVestWage > 0) {
      const federalRate = rsuVestFederal / rsuVestWage
      const stateRate = rsuVestState / rsuVestWage
      
      acc.wage += vestValue
      acc.federal += vestValue * federalRate
      acc.state += vestValue * stateRate
    } else {
      acc.wage += vestValue
      // Default withholding rates if no historical data
      acc.federal += vestValue * 0.24 // Estimate 24% federal
      acc.state += vestValue * 0.10 // Estimate 10% state
    }
    
    return acc
  }, { wage: 0, federal: 0, state: 0 })

  return {
    totalWage: paycheckTotal.wage + rsuTotals.wage,
    totalFederalWithhold: paycheckTotal.federal + rsuTotals.federal,
    totalStateWithhold: paycheckTotal.state + rsuTotals.state
  }
}

/**
 * Aggregate income data for a single person (user or spouse)
 */
function aggregateIndividualIncome(income: IncomeData): {
  totalIncome: number
  investmentIncome: {
    ordinaryDividends: number
    qualifiedDividends: number
    interestIncome: number
    shortTermGains: number
    longTermGains: number
  }
  wageIncome: number
  totalWithholdings: {
    federal: number
    state: number
  }
} {
  const investmentIncome = {
    ordinaryDividends: parseFloat(income.ordinaryDividends) || 0,
    qualifiedDividends: parseFloat(income.qualifiedDividends) || 0,
    interestIncome: parseFloat(income.interestIncome) || 0,
    shortTermGains: parseFloat(income.shortTermGains) || 0,
    longTermGains: parseFloat(income.longTermGains) || 0
  }

  const ytdWage = parseFloat(income.ytdWage) || 0
  const ytdFederalWithhold = parseFloat(income.ytdFederalWithhold) || 0
  const ytdStateWithhold = parseFloat(income.ytdStateWithhold) || 0

  const futureIncome = calculateFutureIncome(income)

  const totalWageIncome = ytdWage + futureIncome.totalWage
  const totalInvestmentIncome = Object.values(investmentIncome).reduce((sum, value) => sum + value, 0)

  return {
    totalIncome: totalWageIncome + totalInvestmentIncome,
    investmentIncome,
    wageIncome: totalWageIncome,
    totalWithholdings: {
      federal: ytdFederalWithhold + futureIncome.totalFederalWithhold,
      state: ytdStateWithhold + futureIncome.totalStateWithhold
    }
  }
}

/**
 * Calculate total income for an individual (for display purposes)
 */
export function calculateIndividualTotalIncome(income: IncomeData): number {
  const aggregated = aggregateIndividualIncome(income)
  return aggregated.totalIncome
}

/**
 * Calculate estimated California state tax for SALT deduction
 */
export function calculateEstimatedCAStateTax(
  userIncome: IncomeData,
  spouseIncome: IncomeData,
  filingStatus: FilingStatus | null,
  taxYear: TaxYear
): number {
  if (!filingStatus) return 0
  
  const userAgg = aggregateIndividualIncome(userIncome)
  const spouseAgg = filingStatus === 'marriedFilingJointly' 
    ? aggregateIndividualIncome(spouseIncome) 
    : { totalIncome: 0, investmentIncome: {
        ordinaryDividends: 0, qualifiedDividends: 0, interestIncome: 0,
        shortTermGains: 0, longTermGains: 0
      }, wageIncome: 0, totalWithholdings: { federal: 0, state: 0 } }
  
  const totalIncome = userAgg.totalIncome + spouseAgg.totalIncome
  
  // Simplified CA tax calculation for SALT estimation
  const standardDeduction = getCaliforniaStandardDeduction(taxYear, filingStatus)
  
  const caResult = calculateCaliforniaTax(totalIncome, standardDeduction, filingStatus, taxYear)
  return caResult.totalTax
}

/**
 * Calculate federal itemized deductions with SALT cap and mortgage interest limits
 */
export function calculateFederalItemizedDeductions(
  deductions: DeductionsData,
  userIncome: IncomeData,
  spouseIncome: IncomeData,
  filingStatus: FilingStatus | null,
  includeCaliforniaTax: boolean,
  taxYear: TaxYear
): number {
  const propertyTax = parseFloat(deductions.propertyTax) || 0
  const mortgageInterest = parseFloat(deductions.mortgageInterest) || 0
  const donations = parseFloat(deductions.donations) || 0
  const mortgageBalance = parseFloat(deductions.mortgageBalance) || 0
  
  // Calculate state income tax for SALT
  const stateIncomeTax = includeCaliforniaTax 
    ? calculateEstimatedCAStateTax(userIncome, spouseIncome, filingStatus, taxYear)
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
 * Calculate just California withholdings from all sources
 */
export function calculateCaliforniaWithholdings(
  userIncome: IncomeData,
  spouseIncome: IncomeData,
  filingStatus: FilingStatus | null
): number {
  const userAgg = aggregateIndividualIncome(userIncome)
  const spouseAgg = filingStatus === 'marriedFilingJointly' 
    ? aggregateIndividualIncome(spouseIncome) 
    : { totalWithholdings: { state: 0 } }
  
  return userAgg.totalWithholdings.state + spouseAgg.totalWithholdings.state
}

interface EstimatedPaymentSuggestion {
  quarter: string
  dueDate: string
  amount: number
  isPaid: boolean
  isPastDue: boolean
}

/**
 * Calculate suggested federal estimated tax payments
 */
export function calculateFederalEstimatedPayments(
  amountOwed: number,
  estimatedPayments: EstimatedPaymentsData
): EstimatedPaymentSuggestion[] {
  const currentDate = new Date()
  const quarters = [
    { quarter: 'Q1', dueDate: 'April 15, 2025', dueDateObj: new Date('2025-04-15'), paid: parseFloat(estimatedPayments.federalQ1) || 0 },
    { quarter: 'Q2', dueDate: 'June 16, 2025', dueDateObj: new Date('2025-06-16'), paid: parseFloat(estimatedPayments.federalQ2) || 0 },
    { quarter: 'Q3', dueDate: 'September 15, 2025', dueDateObj: new Date('2025-09-15'), paid: parseFloat(estimatedPayments.federalQ3) || 0 },
    { quarter: 'Q4', dueDate: 'January 15, 2026', dueDateObj: new Date('2026-01-15'), paid: parseFloat(estimatedPayments.federalQ4) || 0 }
  ]
  
  // Only count unpaid quarters that are not past due
  const unpaidFutureQuarters = quarters.filter(q => q.paid === 0 && q.dueDateObj > currentDate).length
  const remainingAmount = Math.max(0, amountOwed)
  const perQuarterAmount = unpaidFutureQuarters > 0 ? remainingAmount / unpaidFutureQuarters : 0
  
  return quarters.map(q => {
    const isPastDue = q.dueDateObj <= currentDate
    return {
      quarter: q.quarter,
      dueDate: q.dueDate,
      amount: q.paid > 0 ? q.paid : (isPastDue ? 0 : perQuarterAmount),
      isPaid: q.paid > 0,
      isPastDue: isPastDue && q.paid === 0
    }
  })
}

/**
 * Calculate suggested California estimated tax payments with weighted schedule
 */
export function calculateCaliforniaEstimatedPayments(
  amountOwed: number,
  estimatedPayments: EstimatedPaymentsData
): EstimatedPaymentSuggestion[] {
  const currentDate = new Date()
  const quarters = [
    { quarter: 'Q1', dueDate: 'April 15, 2025', dueDateObj: new Date('2025-04-15'), weight: 0.3, paid: parseFloat(estimatedPayments.californiaQ1) || 0 },
    { quarter: 'Q2', dueDate: 'June 16, 2025', dueDateObj: new Date('2025-06-16'), weight: 0.4, paid: parseFloat(estimatedPayments.californiaQ2) || 0 },
    { quarter: 'Q4', dueDate: 'January 15, 2026', dueDateObj: new Date('2026-01-15'), weight: 0.3, paid: parseFloat(estimatedPayments.californiaQ4) || 0 }
  ]
  
  const remainingAmount = Math.max(0, amountOwed)
  const unpaidFutureQuarters = quarters.filter(q => q.paid === 0 && q.dueDateObj > currentDate)
  
  // Calculate adjusted weights for unpaid future quarters
  let adjustedWeights: Record<string, number> = {}
  if (unpaidFutureQuarters.length === 0) {
    // All paid or past due
    quarters.forEach(q => adjustedWeights[q.quarter] = 0)
  } else if (unpaidFutureQuarters.length === 1) {
    // Only one quarter left
    adjustedWeights[unpaidFutureQuarters[0].quarter] = 1
  } else if (unpaidFutureQuarters.length === 2) {
    // Two quarters left - redistribute weights proportionally
    const totalUnpaidWeight = unpaidFutureQuarters.reduce((sum, q) => sum + q.weight, 0)
    unpaidFutureQuarters.forEach(q => {
      adjustedWeights[q.quarter] = q.weight / totalUnpaidWeight
    })
  } else {
    // All unpaid - use original weights for future quarters only
    unpaidFutureQuarters.forEach(q => adjustedWeights[q.quarter] = q.weight)
  }
  
  return quarters.map(q => {
    const isPastDue = q.dueDateObj <= currentDate
    return {
      quarter: q.quarter,
      dueDate: q.dueDate,
      amount: q.paid > 0 ? q.paid : (isPastDue ? 0 : remainingAmount * (adjustedWeights[q.quarter] || 0)),
      isPaid: q.paid > 0,
      isPastDue: isPastDue && q.paid === 0
    }
  })
}

/**
 * Calculate comprehensive tax results based on all user input
 */
export function calculateComprehensiveTax(
  taxYear: TaxYear,
  filingStatus: FilingStatus | null,
  includeCaliforniaTax: boolean,
  deductions: DeductionsData,
  userIncome: IncomeData,
  spouseIncome: IncomeData,
  estimatedPayments: EstimatedPaymentsData
): TaxCalculationResult | null {
  if (!filingStatus) {
    return null
  }

  // Aggregate income from user and spouse
  const userAgg = aggregateIndividualIncome(userIncome)
  const spouseAgg = filingStatus === 'marriedFilingJointly' 
    ? aggregateIndividualIncome(spouseIncome) 
    : { totalIncome: 0, investmentIncome: {
        ordinaryDividends: 0, qualifiedDividends: 0, interestIncome: 0,
        shortTermGains: 0, longTermGains: 0
      }, wageIncome: 0, totalWithholdings: { federal: 0, state: 0 } }

  const totalIncome = userAgg.totalIncome + spouseAgg.totalIncome
  const adjustedGrossIncome = totalIncome // Simplified - no adjustments for now

  // Calculate deductions with SALT cap and mortgage limits
  const federalItemized = calculateFederalItemizedDeductions(
    deductions,
    userIncome,
    spouseIncome,
    filingStatus,
    includeCaliforniaTax,
    taxYear
  )
  
  const californiaItemized = calculateCaliforniaItemizedDeductions(deductions)

  const standardDeductionFederal = getFederalStandardDeduction(taxYear, filingStatus)
  const standardDeductionCA = includeCaliforniaTax 
    ? getCaliforniaStandardDeduction(taxYear, filingStatus) 
    : 0

  const federalDeduction = Math.max(federalItemized, standardDeductionFederal)
  const californiaDeduction = includeCaliforniaTax 
    ? Math.max(californiaItemized, standardDeductionCA) 
    : 0

  const deductionType: 'standard' | 'itemized' = federalItemized > standardDeductionFederal ? 'itemized' : 'standard'

  // Prepare income breakdown for federal tax calculation
  const federalIncomeBreakdown = {
    ordinaryIncome: userAgg.wageIncome + spouseAgg.wageIncome + 
      userAgg.investmentIncome.ordinaryDividends + spouseAgg.investmentIncome.ordinaryDividends +
      userAgg.investmentIncome.interestIncome + spouseAgg.investmentIncome.interestIncome +
      userAgg.investmentIncome.shortTermGains + spouseAgg.investmentIncome.shortTermGains,
    qualifiedDividends: userAgg.investmentIncome.qualifiedDividends + spouseAgg.investmentIncome.qualifiedDividends,
    longTermCapitalGains: userAgg.investmentIncome.longTermGains + spouseAgg.investmentIncome.longTermGains,
    shortTermCapitalGains: 0 // Already included in ordinary income
  }

  // Calculate federal tax
  const federalTaxResult = calculateFederalTax(
    federalIncomeBreakdown,
    federalDeduction,
    filingStatus,
    taxYear
  )

  // Calculate California tax if applicable
  let californiaTaxResult = null
  if (includeCaliforniaTax) {
    californiaTaxResult = calculateCaliforniaTax(
      totalIncome,
      californiaDeduction,
      filingStatus,
      taxYear
    )
  }

  // Calculate total withholdings and estimated payments
  const totalWithholdings = userAgg.totalWithholdings.federal + spouseAgg.totalWithholdings.federal +
    (includeCaliforniaTax ? (userAgg.totalWithholdings.state + spouseAgg.totalWithholdings.state) : 0)

  const federalEstimatedPayments = 
    (parseFloat(estimatedPayments.federalQ1) || 0) +
    (parseFloat(estimatedPayments.federalQ2) || 0) +
    (parseFloat(estimatedPayments.federalQ3) || 0) +
    (parseFloat(estimatedPayments.federalQ4) || 0)

  const californiaEstimatedPayments = includeCaliforniaTax ? 
    (parseFloat(estimatedPayments.californiaQ1) || 0) +
    (parseFloat(estimatedPayments.californiaQ2) || 0) +
    (parseFloat(estimatedPayments.californiaQ4) || 0) : 0

  const totalEstimatedPayments = federalEstimatedPayments + californiaEstimatedPayments

  // Calculate what's owed or refund
  const totalTaxLiability = federalTaxResult.totalTax + (californiaTaxResult?.totalTax || 0)
  const totalPayments = totalWithholdings + totalEstimatedPayments
  const taxOwedOrRefund = totalTaxLiability - totalPayments

  const federalPayments = userAgg.totalWithholdings.federal + spouseAgg.totalWithholdings.federal + federalEstimatedPayments
  const federalOwedOrRefund = federalTaxResult.totalTax - federalPayments

  const californiaOwedOrRefund = californiaTaxResult ? 
    californiaTaxResult.totalTax - (userAgg.totalWithholdings.state + spouseAgg.totalWithholdings.state + californiaEstimatedPayments) : 
    undefined

  return {
    totalIncome,
    adjustedGrossIncome,
    deductionAmount: federalDeduction,
    deductionType,
    taxableIncome: federalTaxResult.taxableIncome,
    federalTax: {
      ordinaryIncomeTax: federalTaxResult.ordinaryIncomeTax,
      capitalGainsTax: federalTaxResult.capitalGainsTax,
      totalTax: federalTaxResult.totalTax
    },
    californiaTax: californiaTaxResult ? {
      baseTax: californiaTaxResult.baseTax,
      mentalHealthTax: californiaTaxResult.mentalHealthTax,
      totalTax: californiaTaxResult.totalTax
    } : undefined,
    totalWithholdings,
    totalEstimatedPayments,
    taxOwedOrRefund,
    federalOwedOrRefund,
    californiaOwedOrRefund
  }
}
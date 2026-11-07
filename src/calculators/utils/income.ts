import type { IncomeData } from '@/store/useStore'

// Re-export for backward compatibility
export type { IncomeData }

/**
 * Parse a YYYY-MM-DD date string as a local date (new Date('YYYY-MM-DD') parses as UTC,
 * which shifts the day backwards in US time zones)
 */
export function parseLocalDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }
  return new Date(value)
}

/**
 * Count pay dates from nextPayDate onwards that fall inside the tax year
 * (and not after lastPayDate, if given)
 */
function countPayDatesInTaxYear(
  nextPayDate: string,
  payFrequency: 'biweekly' | 'monthly',
  lastPayDate: string | undefined,
  taxYear: number
): number {
  const yearStart = new Date(taxYear, 0, 1)
  const yearEnd = new Date(taxYear, 11, 31)
  let endDate = yearEnd
  if (lastPayDate) {
    const lastPay = parseLocalDate(lastPayDate)
    if (lastPay < endDate) endDate = lastPay
  }

  const firstPay = parseLocalDate(nextPayDate)
  if (isNaN(firstPay.getTime()) || firstPay > endDate) return 0

  let count = 0
  let step = 0
  let payDate = new Date(firstPay)
  while (payDate <= endDate) {
    if (payDate >= yearStart) count++
    step++
    payDate = new Date(firstPay)
    if (payFrequency === 'biweekly') {
      payDate.setDate(firstPay.getDate() + 14 * step)
    } else {
      payDate.setMonth(firstPay.getMonth() + step)
    }
  }
  return count
}

/**
 * Calculate future income from paychecks and RSU vests
 * @param taxYear - Only paychecks dated within this tax year are counted (defaults to the current year)
 */
export function calculateFutureIncome(income: IncomeData, taxYearInput: number = new Date().getFullYear()): {
  totalWage: number
  totalFederalWithhold: number
  totalStateWithhold: number
} {
  const taxYear = Number(taxYearInput)
  // If using simple mode, just return the direct values
  if (income.incomeMode === 'simple') {
    return {
      totalWage: parseFloat(income.futureWage) || 0,
      totalFederalWithhold: parseFloat(income.futureFederalWithhold) || 0,
      totalStateWithhold: parseFloat(income.futureStateWithhold) || 0
    }
  }

  // Otherwise calculate from detailed paycheck and RSU data
  const paycheckAmount = parseFloat(income.paycheckWage) || 0
  const paycheckFederal = parseFloat(income.paycheckFederal) || 0
  const paycheckState = parseFloat(income.paycheckState) || 0

  // Calculate remaining paychecks (only those dated within the tax year)
  let paychecksRemaining = 0
  if (income.nextPayDate) {
    paychecksRemaining = countPayDatesInTaxYear(income.nextPayDate, income.payFrequency, income.lastPayDate, taxYear)
  } else {
    // Fallback if no next payment date specified: estimate from the remaining weeks of the tax year
    const yearStart = new Date(taxYear, 0, 1)
    const now = new Date()
    const startDate = now > yearStart ? now : yearStart
    let endDate = new Date(taxYear, 11, 31)
    if (income.lastPayDate) {
      const lastPayDate = parseLocalDate(income.lastPayDate)
      if (lastPayDate < endDate) endDate = lastPayDate
    }
    
    const weeksRemaining = Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    
    paychecksRemaining = income.payFrequency === 'biweekly' 
      ? Math.ceil(weeksRemaining / 2) 
      : Math.ceil(weeksRemaining / 4.33) // Approximate weeks per month
  }

  const paycheckTotal = {
    wage: Math.round(paycheckAmount * paychecksRemaining),
    federal: Math.round(paycheckFederal * paychecksRemaining),
    state: Math.round(paycheckState * paychecksRemaining)
  }
  

  // Add RSU vests (a vest with a date outside the tax year belongs to another year)
  const rsuTotals = (income.futureRSUVests || [])
    .filter(vest => !vest.date || parseLocalDate(vest.date).getFullYear() === taxYear)
    .reduce((acc, vest) => {
    const shares = parseFloat(vest.shares) || 0
    const price = parseFloat(vest.expectedPrice) || 0
    const vestValue = shares * price
    
    
    // Only process if there's actual vest value
    if (vestValue > 0) {
      // Estimate withholdings based on most recent RSU vest data if available
      // NOTE: rsuVestWage is a PAST vest already included in YTD W2 wage
      // We use it ONLY to calculate withholding rates, NOT to add to income
      const rsuVestWage = parseFloat(income.rsuVestWage) || 0
      const rsuVestFederal = parseFloat(income.rsuVestFederal) || 0
      const rsuVestState = parseFloat(income.rsuVestState) || 0
      
      if (rsuVestWage > 0) {
        const federalRate = rsuVestFederal / rsuVestWage
        const stateRate = rsuVestState / rsuVestWage
        
        acc.wage += vestValue
        acc.federal += Math.round(vestValue * federalRate)
        acc.state += Math.round(vestValue * stateRate)
      } else {
        acc.wage += vestValue
        // Default withholding rates if no historical data
        acc.federal += Math.round(vestValue * 0.24) // Estimate 24% federal
        acc.state += Math.round(vestValue * 0.10) // Estimate 10% state
      }
    }
    
    return acc
  }, { wage: 0, federal: 0, state: 0 })

  const result = {
    totalWage: Math.round(paycheckTotal.wage + rsuTotals.wage),
    totalFederalWithhold: Math.round(paycheckTotal.federal + rsuTotals.federal),
    totalStateWithhold: Math.round(paycheckTotal.state + rsuTotals.state)
  }
  
  
  return result
}

/**
 * Aggregate income data for a single person (user or spouse)
 * 
 * IMPORTANT: The rsuVestWage field represents a PAST RSU vest that is already
 * included in the YTD W2 wage. It is used ONLY to calculate withholding rates
 * for future RSU vests, NOT added to total income.
 */
export function aggregateIndividualIncome(income: IncomeData, taxYear?: number): {
  totalIncome: number
  investmentIncome: {
    ordinaryDividends: number
    qualifiedDividends: number
    interestIncome: number
    shortTermGains: number
    longTermGains: number
  }
  wageIncome: number
  rothConversion: number
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

  const futureIncome = calculateFutureIncome(income, taxYear)

  const totalWageIncome = ytdWage + futureIncome.totalWage
  const rothConversion = parseFloat(income.rothConversion) || 0

  // Don't double-count qualified dividends - they're already included in ordinary dividends
  const totalInvestmentIncome =
    investmentIncome.ordinaryDividends + // This already includes qualified dividends
    investmentIncome.interestIncome +
    investmentIncome.shortTermGains +
    investmentIncome.longTermGains
    // Note: NOT adding qualifiedDividends separately as they're part of ordinaryDividends
    // Note: Capital loss limit is applied at the tax calculation level, not here

  const result = {
    totalIncome: totalWageIncome + totalInvestmentIncome + rothConversion,
    investmentIncome,
    wageIncome: totalWageIncome,
    rothConversion,
    totalWithholdings: {
      federal: ytdFederalWithhold + futureIncome.totalFederalWithhold,
      state: ytdStateWithhold + futureIncome.totalStateWithhold
    }
  }
  
  
  return result
}

/**
 * Calculate total income for an individual (for display purposes)
 */
export function calculateIndividualTotalIncome(income: IncomeData, taxYear?: number): number {
  const aggregated = aggregateIndividualIncome(income, taxYear)
  return aggregated.totalIncome
}

/**
 * Calculate withholding rates from RSU vest data
 */
export function calculateWithholdingRates(income: IncomeData): {
  federalRate: number
  stateRate: number
} {
  const rsuVestWage = parseFloat(income.rsuVestWage) || 0
  const rsuVestFederal = parseFloat(income.rsuVestFederal) || 0
  const rsuVestState = parseFloat(income.rsuVestState) || 0
  
  if (rsuVestWage > 0) {
    return {
      federalRate: rsuVestFederal / rsuVestWage,
      stateRate: rsuVestState / rsuVestWage
    }
  }
  
  // Default rates if no historical data
  return {
    federalRate: 0.22, // 22% default federal supplemental rate
    stateRate: 0.10   // 10% default state rate
  }
}

/**
 * Calculate remaining paychecks for the year
 */
export function calculateRemainingPaychecks(
  nextPayDate: string,
  payFrequency: 'biweekly' | 'monthly',
  lastPayDate?: string,
  taxYear?: number
): number {
  if (!nextPayDate) return 0
  const year = taxYear ?? parseLocalDate(nextPayDate).getFullYear()
  return countPayDatesInTaxYear(nextPayDate, payFrequency, lastPayDate, year)
}

/**
 * Calculate projected paycheck income
 */
export function calculateProjectedPaycheckIncome(income: IncomeData, taxYear?: number): {
  remainingPaychecks: number
  projectedWage: number
  projectedFederalWithhold: number
  projectedStateWithhold: number
} {
  const paycheckWage = parseFloat(income.paycheckWage) || 0
  const paycheckFederal = parseFloat(income.paycheckFederal) || 0
  const paycheckState = parseFloat(income.paycheckState) || 0
  
  const remainingPaychecks = calculateRemainingPaychecks(income.nextPayDate, income.payFrequency, income.lastPayDate, taxYear)
  
  return {
    remainingPaychecks,
    projectedWage: remainingPaychecks * paycheckWage,
    projectedFederalWithhold: remainingPaychecks * paycheckFederal,
    projectedStateWithhold: remainingPaychecks * paycheckState
  }
}

/**
 * Calculate RSU vest value and withholdings
 */
export function calculateRSUVestValue(shares: string, price: string, income: IncomeData): {
  vestValue: number
  estimatedFederal: number
  estimatedState: number
  federalRate: number
  stateRate: number
} {
  const numShares = parseFloat(shares) || 0
  const sharePrice = parseFloat(price) || 0
  const vestValue = numShares * sharePrice
  
  const { federalRate, stateRate } = calculateWithholdingRates(income)
  
  return {
    vestValue,
    estimatedFederal: vestValue * federalRate,
    estimatedState: vestValue * stateRate,
    federalRate,
    stateRate
  }
}
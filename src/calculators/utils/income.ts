import type { IncomeData } from '@/store/useStore'

// Re-export for backward compatibility
export type { IncomeData }

/**
 * Calculate future income from paychecks and RSU vests
 */
export function calculateFutureIncome(income: IncomeData): {
  totalWage: number
  totalFederalWithhold: number
  totalStateWithhold: number
} {
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

  // Calculate remaining paychecks
  let paychecksRemaining = 0
  if (income.nextPayDate) {
    const nextPayDate = new Date(income.nextPayDate)
    const currentDate = new Date()
    const yearEnd = new Date(currentDate.getFullYear(), 11, 31)
    
    if (nextPayDate <= yearEnd) {
      // Count paychecks from next pay date until year end
      let payDate = new Date(nextPayDate)
      while (payDate <= yearEnd) {
        paychecksRemaining++
        if (income.payFrequency === 'biweekly') {
          payDate.setDate(payDate.getDate() + 14)
        } else { // monthly
          payDate.setMonth(payDate.getMonth() + 1)
        }
      }
    }
  } else {
    // Fallback if no next payment date specified
    const currentDate = new Date()
    const yearEnd = new Date(currentDate.getFullYear(), 11, 31)
    const weeksRemaining = Math.max(0, Math.ceil((yearEnd.getTime() - currentDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    
    paychecksRemaining = income.payFrequency === 'biweekly' 
      ? Math.ceil(weeksRemaining / 2) 
      : Math.ceil(weeksRemaining / 4.33) // Approximate weeks per month
  }

  const paycheckTotal = {
    wage: Math.round(paycheckAmount * paychecksRemaining),
    federal: Math.round(paycheckFederal * paychecksRemaining),
    state: Math.round(paycheckState * paychecksRemaining)
  }
  

  // Add RSU vests
  const rsuTotals = (income.futureRSUVests || []).reduce((acc, vest) => {
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
export function aggregateIndividualIncome(income: IncomeData): {
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
  
  // Don't double-count qualified dividends - they're already included in ordinary dividends
  const totalInvestmentIncome = 
    investmentIncome.ordinaryDividends + // This already includes qualified dividends
    investmentIncome.interestIncome + 
    investmentIncome.shortTermGains + 
    investmentIncome.longTermGains
    // Note: NOT adding qualifiedDividends separately as they're part of ordinaryDividends
    // Note: Capital loss limit is applied at the tax calculation level, not here

  const result = {
    totalIncome: totalWageIncome + totalInvestmentIncome,
    investmentIncome,
    wageIncome: totalWageIncome,
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
export function calculateIndividualTotalIncome(income: IncomeData): number {
  const aggregated = aggregateIndividualIncome(income)
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
export function calculateRemainingPaychecks(nextPayDate: string, payFrequency: 'biweekly' | 'monthly'): number {
  if (!nextPayDate) return 0
  
  const nextPay = new Date(nextPayDate)
  const yearEnd = new Date(nextPay.getFullYear(), 11, 31)
  
  if (nextPay > yearEnd) return 0
  
  if (payFrequency === 'biweekly') {
    const daysRemaining = Math.max(0, (yearEnd.getTime() - nextPay.getTime()) / (24 * 60 * 60 * 1000))
    return Math.floor(daysRemaining / 14) + 1
  } else {
    let count = 0
    let currentMonth = nextPay.getMonth()
    let currentYear = nextPay.getFullYear()
    
    while (currentYear === nextPay.getFullYear() && currentMonth <= 11) {
      count++
      currentMonth++
    }
    return count
  }
}

/**
 * Calculate projected paycheck income
 */
export function calculateProjectedPaycheckIncome(income: IncomeData): {
  remainingPaychecks: number
  projectedWage: number
  projectedFederalWithhold: number
  projectedStateWithhold: number
} {
  const paycheckWage = parseFloat(income.paycheckWage) || 0
  const paycheckFederal = parseFloat(income.paycheckFederal) || 0
  const paycheckState = parseFloat(income.paycheckState) || 0
  
  const remainingPaychecks = calculateRemainingPaychecks(income.nextPayDate, income.payFrequency)
  
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
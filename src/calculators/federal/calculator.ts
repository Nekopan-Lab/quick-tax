import { FilingStatus } from '@/types'
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
  taxableIncome: number
  ordinaryIncomeTax: number
  capitalGainsTax: number
  totalTax: number
}

/**
 * Calculate federal income tax based on income breakdown and deductions
 * @param income - Breakdown of different income types
 * @param deductions - Total deduction amount (standard or itemized)
 * @param filingStatus - Filing status (single or marriedFilingJointly)
 * @param taxYear - Tax year for calculations
 * @returns Federal tax calculation result
 */
export function calculateFederalTax(
  income: FederalIncomeBreakdown,
  deductions: number,
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
  const taxableIncome = Math.max(0, totalIncome - deductions)

  // Short-term capital gains are taxed as ordinary income
  const ordinaryIncomeForTax = income.ordinaryIncome + income.shortTermCapitalGains
  
  // Calculate ordinary taxable income (excluding qualified dividends and LTCG)
  const ordinaryTaxableIncome = Math.max(0, ordinaryIncomeForTax - deductions)
  
  // Calculate tax on ordinary income
  const ordinaryIncomeTax = calculateProgressiveTax(
    ordinaryTaxableIncome,
    getFederalTaxBrackets(taxYear, filingStatus)
  )

  // Calculate capital gains and qualified dividends tax
  // First, we need to determine how much of the deduction has been used by ordinary income
  const deductionUsedByOrdinary = Math.min(deductions, ordinaryIncomeForTax)
  const remainingDeduction = deductions - deductionUsedByOrdinary
  
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
    ordinaryIncomeTax: Math.round(ordinaryIncomeTax * 100) / 100,
    capitalGainsTax: Math.round(capitalGainsTax * 100) / 100,
    totalTax: Math.round((ordinaryIncomeTax + capitalGainsTax) * 100) / 100
  }
}

// Re-export the helper function for backwards compatibility
export { getFederalStandardDeduction }
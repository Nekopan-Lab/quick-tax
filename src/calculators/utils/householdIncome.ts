import { aggregateIndividualIncome, type IncomeData } from './income'
import type { FilingStatus } from '@/types'

export interface HouseholdIncomeAggregation {
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
}

/**
 * Aggregate income data for the entire household (user + spouse if applicable)
 * This centralizes the logic for combining user and spouse income based on filing status
 */
export function aggregateHouseholdIncome(
  userIncome: IncomeData,
  spouseIncome: IncomeData,
  filingStatus: FilingStatus
): HouseholdIncomeAggregation {
  // Always aggregate user income
  const userAgg = aggregateIndividualIncome(userIncome)
  
  // Only aggregate spouse income if married filing jointly
  const includeSpouse = filingStatus === 'marriedFilingJointly'
  const spouseAgg = includeSpouse ? aggregateIndividualIncome(spouseIncome) : null
  
  // Combine the incomes
  return {
    totalIncome: userAgg.totalIncome + (spouseAgg?.totalIncome || 0),
    investmentIncome: {
      ordinaryDividends: userAgg.investmentIncome.ordinaryDividends + (spouseAgg?.investmentIncome.ordinaryDividends || 0),
      qualifiedDividends: userAgg.investmentIncome.qualifiedDividends + (spouseAgg?.investmentIncome.qualifiedDividends || 0),
      interestIncome: userAgg.investmentIncome.interestIncome + (spouseAgg?.investmentIncome.interestIncome || 0),
      shortTermGains: userAgg.investmentIncome.shortTermGains + (spouseAgg?.investmentIncome.shortTermGains || 0),
      longTermGains: userAgg.investmentIncome.longTermGains + (spouseAgg?.investmentIncome.longTermGains || 0)
    },
    wageIncome: userAgg.wageIncome + (spouseAgg?.wageIncome || 0),
    totalWithholdings: {
      federal: userAgg.totalWithholdings.federal + (spouseAgg?.totalWithholdings.federal || 0),
      state: userAgg.totalWithholdings.state + (spouseAgg?.totalWithholdings.state || 0)
    }
  }
}

/**
 * Helper to get individual aggregations when needed for specific calculations
 * This maintains backward compatibility while encouraging use of household aggregation
 */
export function getIndividualAggregations(
  userIncome: IncomeData,
  spouseIncome: IncomeData,
  filingStatus: FilingStatus
) {
  const userAgg = aggregateIndividualIncome(userIncome)
  const spouseAgg = filingStatus === 'marriedFilingJointly' 
    ? aggregateIndividualIncome(spouseIncome)
    : null
    
  return { userAgg, spouseAgg }
}
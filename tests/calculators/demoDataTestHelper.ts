import type { IncomeData, DeductionsData, EstimatedPaymentsData } from '../../src/store/useStore'

/**
 * Fixed demo data for testing with consistent dates and values
 * This ensures tests produce consistent results regardless of when they run
 */

// Fixed date: June 15, 2025 (middle of Q2)
const FIXED_CURRENT_DATE = new Date('2025-06-15')
const FIXED_YEAR = 2025

// Fixed next pay date: June 20, 2025 (Friday)
const FIXED_NEXT_PAY_DATE = '2025-06-20'

export const FIXED_DEMO_USER_INCOME: IncomeData = {
  // Investment Income (moderate savings)
  ordinaryDividends: '1500',
  qualifiedDividends: '1200', // 80% of dividends are qualified
  interestIncome: '800', // High-yield savings interest
  shortTermGains: '500', // Small trading gains
  longTermGains: '3000', // Some stock sales
  
  // YTD W2 (assuming we're in Q2, so ~40% through year)
  ytdWage: '50000', // Base salary portion (~$130k annual)
  ytdFederalWithhold: '7500', // ~15% withholding (intentionally low)
  ytdStateWithhold: '2500', // ~5% withholding (intentionally low)
  
  // Future Income - Detailed Mode
  incomeMode: 'detailed',
  paycheckWage: '5000', // ~$130k base salary annually
  paycheckFederal: '750', // 15% federal withholding
  paycheckState: '250', // 5% state withholding
  payFrequency: 'biweekly',
  nextPayDate: FIXED_NEXT_PAY_DATE,
  
  // RSU Data (moderate tech compensation)
  rsuVestWage: '15000', // Recent vest - NOT included in total income
  rsuVestFederal: '2250', // 15% federal withholding (lower than typical)
  rsuVestState: '750', // 5% state withholding
  vestPrice: '150',
  futureRSUVests: [
    {
      id: 'demo-vest-1',
      shares: '200',
      expectedPrice: '150'
    },
    {
      id: 'demo-vest-2', 
      shares: '200',
      expectedPrice: '150'
    }
  ],
  
  // Simple mode fields (not used when in detailed mode)
  futureWage: '',
  futureFederalWithhold: '',
  futureStateWithhold: ''
}

export const FIXED_DEMO_SPOUSE_INCOME: IncomeData = {
  // Investment Income (joint investment account)
  ordinaryDividends: '1000',
  qualifiedDividends: '800',
  interestIncome: '600',
  shortTermGains: '0',
  longTermGains: '2000',
  
  // YTD W2 (non-tech role)
  ytdWage: '40000',
  ytdFederalWithhold: '6000', // ~15% withholding (intentionally low)
  ytdStateWithhold: '2000', // ~5% withholding (intentionally low)
  
  // Future Income - Detailed Mode
  incomeMode: 'detailed',
  paycheckWage: '3846', // ~$100k base salary annually
  paycheckFederal: '577', // 15% federal withholding
  paycheckState: '192', // 5% state withholding
  payFrequency: 'biweekly',
  nextPayDate: FIXED_NEXT_PAY_DATE,
  
  // RSU Data
  rsuVestWage: '0', // No recent vest
  rsuVestFederal: '0',
  rsuVestState: '0',
  vestPrice: '',
  futureRSUVests: [], // No RSUs for spouse
  
  // Simple mode fields (not used)
  futureWage: '',
  futureFederalWithhold: '',
  futureStateWithhold: ''
}

export const FIXED_DEMO_DEDUCTIONS: DeductionsData = {
  propertyTax: '8000', // ~$800k home value at 1% tax rate
  mortgageInterest: '12000', // Modest mortgage at 6%
  mortgageLoanDate: 'after-dec-15-2017', // Recent purchase
  mortgageBalance: '400000',
  donations: '2000', // ~0.7% of gross income
  otherStateIncomeTax: '0' // Not applicable for CA residents
}

export const FIXED_DEMO_ESTIMATED_PAYMENTS: EstimatedPaymentsData = {
  // Small federal Q1 payment made, no CA payments yet
  federalQ1: '500',
  federalQ2: '0',
  federalQ3: '0',
  federalQ4: '0',
  californiaQ1: '0',
  californiaQ2: '0',
  californiaQ4: '0'
}

/**
 * Calculate expected number of paychecks from June 20, 2025 to end of year
 * Biweekly = every 14 days
 * 
 * June 20 -> Dec 31 = 194 days
 * 194 / 14 = 13.86, so 14 paychecks (including June 20)
 */
export const EXPECTED_REMAINING_PAYCHECKS = 14

/**
 * Expected income breakdown:
 * 
 * User:
 * - Investment: 1500 + 800 + 500 + 3000 = 5800
 * - YTD W2: 50000
 * - Future paychecks: 5000 * 14 = 70000
 * - Future RSUs: 200 * 150 + 200 * 150 = 60000
 * - Total: 185800
 * 
 * Spouse:
 * - Investment: 1000 + 600 + 0 + 2000 = 3600
 * - YTD W2: 40000
 * - Future paychecks: 3846 * 14 = 53844
 * - Total: 97444
 * 
 * Household Total: 283244
 * 
 * Note: Recent RSU vest (15000) is NOT included in total income
 */
export const EXPECTED_TOTAL_INCOME = 283244

/**
 * Expected withholdings:
 * 
 * User:
 * - YTD Federal: 7500
 * - Future paycheck federal: 750 * 14 = 10500
 * - Future RSU federal: 60000 * 0.15 = 9000
 * - Total Federal: 27000
 * 
 * - YTD State: 2500
 * - Future paycheck state: 250 * 14 = 3500
 * - Future RSU state: 60000 * 0.05 = 3000
 * - Total State: 9000
 * 
 * Spouse:
 * - YTD Federal: 6000
 * - Future paycheck federal: 577 * 14 = 8078
 * - Total Federal: 14078
 * 
 * - YTD State: 2000
 * - Future paycheck state: 192 * 14 = 2688
 * - Total State: 4688
 * 
 * Household Total Federal: 41078
 * Household Total State: 13688
 */
export const EXPECTED_FEDERAL_WITHHOLDINGS = 41078
export const EXPECTED_STATE_WITHHOLDINGS = 13688
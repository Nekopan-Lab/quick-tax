import type { IncomeData, DeductionsData, EstimatedPaymentsData } from '../store/useStore'

/**
 * Demo data for a moderate income household
 * 
 * This demo is designed to showcase:
 * - Household income around $300,000
 * - Federal standard deduction usage (itemized < $30,000)
 * - California itemized deduction usage (itemized > $11,080)
 * - Owing taxes for both federal and California
 * - Need for estimated tax payments
 */

// Current date for calculating future dates
const today = new Date()

// Calculate next bi-weekly pay date (assuming Friday paydays)
const getNextBiweeklyPaydate = (): string => {
  const date = new Date()
  // Find next Friday
  while (date.getDay() !== 5) {
    date.setDate(date.getDate() + 1)
  }
  // If we're past this Friday, go to next Friday
  if (date <= today) {
    date.setDate(date.getDate() + 7)
  }
  return date.toISOString().split('T')[0]
}


export const DEMO_USER_INCOME: IncomeData = {
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
  nextPayDate: getNextBiweeklyPaydate(),
  
  // RSU Data (moderate tech compensation)
  rsuVestWage: '15000', // Recent vest
  rsuVestFederal: '2250', // 15% federal withholding (lower than typical)
  rsuVestState: '750', // 5% state withholding
  vestPrice: '150',
  futureRSUVests: [
    {
      id: 'demo-vest-1',
      date: '2025-06-15',
      shares: '200',
      expectedPrice: '150'
    },
    {
      id: 'demo-vest-2',
      date: '2025-09-15',
      shares: '200',
      expectedPrice: '150'
    }
  ],
  
  // Simple mode fields (not used when in detailed mode)
  futureWage: '',
  futureFederalWithhold: '',
  futureStateWithhold: ''
}

export const DEMO_SPOUSE_INCOME: IncomeData = {
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
  nextPayDate: getNextBiweeklyPaydate(),
  
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

export const DEMO_DEDUCTIONS: DeductionsData = {
  propertyTax: '8000', // ~$800k home value at 1% tax rate
  mortgageInterest: '12000', // Modest mortgage at 6%
  mortgageLoanDate: 'after-dec-15-2017', // Recent purchase
  mortgageBalance: '400000',
  donations: '2000', // ~0.7% of gross income
  otherStateIncomeTax: '0', // Not applicable for CA residents
  businessExpenses: '0' // No business expenses for regular employee
}

export const DEMO_ESTIMATED_PAYMENTS: EstimatedPaymentsData = {
  // Small federal Q1 payment made, no CA payments yet
  federalQ1: '500',
  federalQ2: '0',
  federalQ3: '0',
  federalQ4: '0',
  californiaQ1: '0',
  californiaQ2: '0',
  californiaQ4: '0'
}

export const DEMO_DATA_DESCRIPTION = `This demo shows a moderate income household:

• Combined household income: ~$300,000
• User has $130k base salary + RSUs, Spouse has $100k base salary
• Modest home with $22,000 total itemized deductions
• Uses federal standard deduction ($30,000) but CA itemized ($22,000)
• Low withholding rates (15% federal, 5% state) result in taxes owed
• Made minimal Q1 federal payment ($500), no CA payments yet
• Demonstrates need for estimated tax payments

You can modify any of these values to match your situation, or clear all data to start fresh.`
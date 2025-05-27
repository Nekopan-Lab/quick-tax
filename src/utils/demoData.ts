import type { IncomeData, DeductionsData, EstimatedPaymentsData, FutureRSUVest } from '../store/useStore'

/**
 * Demo data based on typical Bay Area tech employee household
 * 
 * Data sources and assumptions:
 * - Median household income for tech workers in Bay Area: ~$350,000-450,000
 * - Typical RSU vesting schedule: quarterly
 * - Average property tax: ~$15,000-20,000 (based on $1.5-2M home value)
 * - Average mortgage interest: ~$35,000-45,000 (assuming recent purchase)
 * - Typical charitable donations: 2-3% of income
 * - Investment income from diversified portfolio
 */

// Current date for calculating future dates
const today = new Date()
const currentYear = today.getFullYear()

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

// Generate future RSU vest dates (quarterly)
const generateRSUVestDates = (): FutureRSUVest[] => {
  const vests = []
  const vestMonths = [2, 5, 8, 11] // March, June, September, December
  
  for (const month of vestMonths) {
    const vestDate = new Date(currentYear, month, 15)
    if (vestDate > today) {
      vests.push({
        id: `demo-vest-${month}`,
        date: vestDate.toISOString().split('T')[0],
        shares: '500', // Typical quarterly vest
        expectedPrice: '185' // Reasonable tech stock price
      })
    }
  }
  
  return vests
}

export const DEMO_USER_INCOME: IncomeData = {
  // Investment Income (typical for tech employee with some savings)
  ordinaryDividends: '3500',
  qualifiedDividends: '2800', // 80% of dividends are qualified
  interestIncome: '1200', // High-yield savings interest
  shortTermGains: '-2000', // Some trading losses
  longTermGains: '15000', // Some stock sales
  
  // YTD W2 (assuming we're in Q2, so ~40% through year)
  ytdWage: '85000', // Base salary portion
  ytdFederalWithhold: '22000',
  ytdStateWithhold: '7500',
  
  // Future Income - Detailed Mode
  incomeMode: 'detailed',
  paycheckWage: '7500', // ~$195k base salary annually
  paycheckFederal: '2100',
  paycheckState: '650',
  payFrequency: 'biweekly',
  nextPayDate: getNextBiweeklyPaydate(),
  
  // RSU Data (typical tech compensation)
  rsuVestWage: '46000', // Recent vest
  rsuVestFederal: '12500',
  rsuVestState: '4600',
  vestPrice: '180',
  futureRSUVests: generateRSUVestDates(),
  
  // Simple mode fields (not used when in detailed mode)
  futureWage: '',
  futureFederalWithhold: '',
  futureStateWithhold: ''
}

export const DEMO_SPOUSE_INCOME: IncomeData = {
  // Investment Income (joint investment account)
  ordinaryDividends: '2500',
  qualifiedDividends: '2000',
  interestIncome: '800',
  shortTermGains: '1000',
  longTermGains: '8000',
  
  // YTD W2 (tech PM role)
  ytdWage: '68000',
  ytdFederalWithhold: '16000',
  ytdStateWithhold: '5500',
  
  // Future Income - Detailed Mode
  incomeMode: 'detailed',
  paycheckWage: '6250', // ~$162.5k base salary annually
  paycheckFederal: '1650',
  paycheckState: '520',
  payFrequency: 'biweekly',
  nextPayDate: getNextBiweeklyPaydate(),
  
  // RSU Data
  rsuVestWage: '28000', // Recent vest
  rsuVestFederal: '7500',
  rsuVestState: '2800',
  vestPrice: '140', // Different company
  futureRSUVests: [
    {
      id: 'demo-spouse-vest-1',
      date: new Date(currentYear, 5, 20).toISOString().split('T')[0], // June vest
      shares: '400',
      expectedPrice: '145'
    },
    {
      id: 'demo-spouse-vest-2',
      date: new Date(currentYear, 11, 20).toISOString().split('T')[0], // December vest
      shares: '400',
      expectedPrice: '145'
    }
  ],
  
  // Simple mode fields (not used)
  futureWage: '',
  futureFederalWithhold: '',
  futureStateWithhold: ''
}

export const DEMO_DEDUCTIONS: DeductionsData = {
  propertyTax: '18000', // ~$1.8M home value at 1% tax rate
  mortgageInterest: '42000', // Recent purchase with ~$1.2M mortgage at 7%
  mortgageLoanDate: 'after-dec-15-2017', // Recent purchase
  mortgageBalance: '1200000',
  donations: '8000', // ~2% of gross income
  otherStateIncomeTax: '0' // Not applicable for CA residents
}

export const DEMO_ESTIMATED_PAYMENTS: EstimatedPaymentsData = {
  // Assuming Q1 payment was made
  federalQ1: '8000',
  federalQ2: '0',
  federalQ3: '0',
  federalQ4: '0',
  californiaQ1: '3500',
  californiaQ2: '0',
  californiaQ4: '0'
}

export const DEMO_DATA_DESCRIPTION = `This demo uses typical data for a Bay Area tech household:

• Combined household income: ~$440,000
• Both spouses work in tech with RSU compensation
• Own a home valued at ~$1.8M with recent mortgage
• Moderate investment income from stocks and savings
• Already made Q1 estimated tax payments

You can modify any of these values to match your situation, or clear all data to start fresh.`
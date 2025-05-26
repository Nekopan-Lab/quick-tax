export type FilingStatus = 'single' | 'marriedFilingJointly'
export type TaxYear = 2025 | 2026

export interface DeductionData {
  propertyTax: number
  mortgageInterest: number
  donations: number
}

export interface InvestmentIncome {
  ordinaryDividends: number
  qualifiedDividends: number
  interestIncome: number
  shortTermGains: number
  longTermGains: number
}

export interface W2Income {
  taxableWage: number
  federalWithhold: number
  stateWithhold: number
}

export interface TaxCalculationResult {
  totalIncome: number
  adjustedGrossIncome: number
  deductionAmount: number
  deductionType: 'standard' | 'itemized'
  taxableIncome: number
  federalTax: number
  californiaTax?: number
  totalWithholdings: number
  totalEstimatedPayments: number
  taxOwedOrRefund: number // negative = refund, positive = owed
}
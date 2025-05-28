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

export interface DeductionInfo {
  type: 'standard' | 'itemized'
  amount: number
}

// Note: TaxCalculationResult interface is defined in utils/taxCalculations.ts
// as it's only used there and has a more complex structure
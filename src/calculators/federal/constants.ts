import { FilingStatus } from '@/types'

export type TaxYear = 2025 | 2026

interface TaxBracket {
  min: number
  max: number
  rate: number
}

interface YearlyTaxData {
  taxBrackets: Record<FilingStatus, TaxBracket[]>
  standardDeductions: Record<FilingStatus, number>
  capitalGainsBrackets: Record<FilingStatus, TaxBracket[]>
}

// Federal tax data by year
export const FEDERAL_TAX_DATA: Record<TaxYear, YearlyTaxData> = {
  2025: {
    taxBrackets: {
      single: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 }
      ],
      marriedFilingJointly: [
        { min: 0, max: 23850, rate: 0.10 },
        { min: 23850, max: 96950, rate: 0.12 },
        { min: 96950, max: 206700, rate: 0.22 },
        { min: 206700, max: 394600, rate: 0.24 },
        { min: 394600, max: 501050, rate: 0.32 },
        { min: 501050, max: 751600, rate: 0.35 },
        { min: 751600, max: Infinity, rate: 0.37 }
      ]
    },
    standardDeductions: {
      single: 15000,
      marriedFilingJointly: 30000
    },
    capitalGainsBrackets: {
      single: [
        { min: 0, max: 48350, rate: 0 },
        { min: 48350, max: 533400, rate: 0.15 },
        { min: 533400, max: Infinity, rate: 0.20 }
      ],
      marriedFilingJointly: [
        { min: 0, max: 96700, rate: 0 },
        { min: 96700, max: 600050, rate: 0.15 },
        { min: 600050, max: Infinity, rate: 0.20 }
      ]
    }
  },
  2026: {
    // Placeholder data for 2026 - to be updated when IRS releases official brackets
    taxBrackets: {
      single: [
        { min: 0, max: 12200, rate: 0.10 },
        { min: 12200, max: 49600, rate: 0.12 },
        { min: 49600, max: 105750, rate: 0.22 },
        { min: 105750, max: 202000, rate: 0.24 },
        { min: 202000, max: 256250, rate: 0.32 },
        { min: 256250, max: 640500, rate: 0.35 },
        { min: 640500, max: Infinity, rate: 0.37 }
      ],
      marriedFilingJointly: [
        { min: 0, max: 24400, rate: 0.10 },
        { min: 24400, max: 99200, rate: 0.12 },
        { min: 99200, max: 211500, rate: 0.22 },
        { min: 211500, max: 404000, rate: 0.24 },
        { min: 404000, max: 512500, rate: 0.32 },
        { min: 512500, max: 769000, rate: 0.35 },
        { min: 769000, max: Infinity, rate: 0.37 }
      ]
    },
    standardDeductions: {
      single: 15350,
      marriedFilingJointly: 30700
    },
    capitalGainsBrackets: {
      single: [
        { min: 0, max: 49500, rate: 0 },
        { min: 49500, max: 546000, rate: 0.15 },
        { min: 546000, max: Infinity, rate: 0.20 }
      ],
      marriedFilingJointly: [
        { min: 0, max: 99000, rate: 0 },
        { min: 99000, max: 614000, rate: 0.15 },
        { min: 614000, max: Infinity, rate: 0.20 }
      ]
    }
  }
}

// Helper functions to get data for specific year
export function getFederalTaxBrackets(year: TaxYear, filingStatus: FilingStatus): TaxBracket[] {
  return FEDERAL_TAX_DATA[year].taxBrackets[filingStatus]
}

export function getFederalStandardDeduction(year: TaxYear, filingStatus: FilingStatus): number {
  return FEDERAL_TAX_DATA[year].standardDeductions[filingStatus]
}

export function getFederalCapitalGainsBrackets(year: TaxYear, filingStatus: FilingStatus): TaxBracket[] {
  return FEDERAL_TAX_DATA[year].capitalGainsBrackets[filingStatus]
}
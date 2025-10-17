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
    // Official 2026 IRS tax brackets (announced October 2025, IR-2025-103)
    taxBrackets: {
      single: [
        { min: 0, max: 12400, rate: 0.10 },
        { min: 12400, max: 50400, rate: 0.12 },
        { min: 50400, max: 105700, rate: 0.22 },
        { min: 105700, max: 201775, rate: 0.24 },
        { min: 201775, max: 256225, rate: 0.32 },
        { min: 256225, max: 640600, rate: 0.35 },
        { min: 640600, max: Infinity, rate: 0.37 }
      ],
      marriedFilingJointly: [
        { min: 0, max: 24800, rate: 0.10 },
        { min: 24800, max: 100800, rate: 0.12 },
        { min: 100800, max: 211400, rate: 0.22 },
        { min: 211400, max: 403550, rate: 0.24 },
        { min: 403550, max: 512450, rate: 0.32 },
        { min: 512450, max: 768700, rate: 0.35 },
        { min: 768700, max: Infinity, rate: 0.37 }
      ]
    },
    standardDeductions: {
      single: 16100,
      marriedFilingJointly: 32200
    },
    capitalGainsBrackets: {
      single: [
        { min: 0, max: 49450, rate: 0 },
        { min: 49450, max: 545500, rate: 0.15 },
        { min: 545500, max: Infinity, rate: 0.20 }
      ],
      marriedFilingJointly: [
        { min: 0, max: 98900, rate: 0 },
        { min: 98900, max: 613700, rate: 0.15 },
        { min: 613700, max: Infinity, rate: 0.20 }
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
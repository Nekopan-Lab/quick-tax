import { FilingStatus } from '@/types'
import { TaxYear } from '../federal/constants'

interface TaxBracket {
  min: number
  max: number
  rate: number
}

interface CaliforniaYearlyTaxData {
  taxBrackets: Record<FilingStatus, TaxBracket[]>
  standardDeductions: Record<FilingStatus, number>
  mentalHealthTaxThreshold: number
  mentalHealthTaxRate: number
}

// California tax data by year
export const CALIFORNIA_TAX_DATA: Record<TaxYear, CaliforniaYearlyTaxData> = {
  2025: {
    taxBrackets: {
      single: [
        { min: 0, max: 10756, rate: 0.01 },
        { min: 10756, max: 25499, rate: 0.02 },
        { min: 25499, max: 40245, rate: 0.04 },
        { min: 40245, max: 55866, rate: 0.06 },
        { min: 55866, max: 70606, rate: 0.08 },
        { min: 70606, max: 360659, rate: 0.093 },
        { min: 360659, max: 432787, rate: 0.103 },
        { min: 432787, max: 721314, rate: 0.113 },
        { min: 721314, max: Infinity, rate: 0.123 }
      ],
      marriedFilingJointly: [
        { min: 0, max: 21512, rate: 0.01 },
        { min: 21512, max: 50998, rate: 0.02 },
        { min: 50998, max: 80490, rate: 0.04 },
        { min: 80490, max: 111732, rate: 0.06 },
        { min: 111732, max: 141212, rate: 0.08 },
        { min: 141212, max: 721318, rate: 0.093 },
        { min: 721318, max: 865574, rate: 0.103 },
        { min: 865574, max: 1442628, rate: 0.113 },
        { min: 1442628, max: Infinity, rate: 0.123 }
      ]
    },
    standardDeductions: {
      single: 5540,
      marriedFilingJointly: 11080
    },
    mentalHealthTaxThreshold: 1000000,
    mentalHealthTaxRate: 0.01
  },
  2026: {
    // 2026 CA FTB tax brackets: 2025 FTB schedule indexed by the 3.4% California CPI
    // adjustment (June 2025 - June 2026), rounded to the nearest dollar.
    // MFJ thresholds are 2x the single thresholds.
    taxBrackets: {
      single: [
        { min: 0, max: 11456, rate: 0.01 },
        { min: 11456, max: 27157, rate: 0.02 },
        { min: 27157, max: 42861, rate: 0.04 },
        { min: 42861, max: 59498, rate: 0.06 },
        { min: 59498, max: 75197, rate: 0.08 },
        { min: 75197, max: 384109, rate: 0.093 },
        { min: 384109, max: 460927, rate: 0.103 },
        { min: 460927, max: 768213, rate: 0.113 },
        { min: 768213, max: Infinity, rate: 0.123 }
      ],
      marriedFilingJointly: [
        { min: 0, max: 22912, rate: 0.01 },
        { min: 22912, max: 54314, rate: 0.02 },
        { min: 54314, max: 85722, rate: 0.04 },
        { min: 85722, max: 118996, rate: 0.06 },
        { min: 118996, max: 150394, rate: 0.08 },
        { min: 150394, max: 768218, rate: 0.093 },
        { min: 768218, max: 921854, rate: 0.103 },
        { min: 921854, max: 1536426, rate: 0.113 },
        { min: 1536426, max: Infinity, rate: 0.123 }
      ]
    },
    standardDeductions: {
      single: 5900,
      marriedFilingJointly: 11800
    },
    mentalHealthTaxThreshold: 1000000,
    mentalHealthTaxRate: 0.01
  }
}

// Helper functions to get data for specific year
export function getCaliforniaTaxBrackets(year: TaxYear, filingStatus: FilingStatus): TaxBracket[] {
  return CALIFORNIA_TAX_DATA[year].taxBrackets[filingStatus]
}

export function getCaliforniaStandardDeduction(year: TaxYear, filingStatus: FilingStatus): number {
  return CALIFORNIA_TAX_DATA[year].standardDeductions[filingStatus]
}

export function getCaliforniaMentalHealthTaxThreshold(year: TaxYear): number {
  return CALIFORNIA_TAX_DATA[year].mentalHealthTaxThreshold
}

export function getCaliforniaMentalHealthTaxRate(year: TaxYear): number {
  return CALIFORNIA_TAX_DATA[year].mentalHealthTaxRate
}
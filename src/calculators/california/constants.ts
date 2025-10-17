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
    // Official 2026 CA FTB tax brackets
    taxBrackets: {
      single: [
        { min: 0, max: 11079, rate: 0.01 },
        { min: 11079, max: 26264, rate: 0.02 },
        { min: 26264, max: 41452, rate: 0.04 },
        { min: 41452, max: 57542, rate: 0.06 },
        { min: 57542, max: 72724, rate: 0.08 },
        { min: 72724, max: 371479, rate: 0.093 },
        { min: 371479, max: 445771, rate: 0.103 },
        { min: 445771, max: 742953, rate: 0.113 },
        { min: 742953, max: Infinity, rate: 0.123 }
      ],
      marriedFilingJointly: [
        { min: 0, max: 22158, rate: 0.01 },
        { min: 22158, max: 52528, rate: 0.02 },
        { min: 52528, max: 82904, rate: 0.04 },
        { min: 82904, max: 115084, rate: 0.06 },
        { min: 115084, max: 145448, rate: 0.08 },
        { min: 145448, max: 742958, rate: 0.093 },
        { min: 742958, max: 891542, rate: 0.103 },
        { min: 891542, max: 1485906, rate: 0.113 },
        { min: 1485906, max: Infinity, rate: 0.123 }
      ]
    },
    standardDeductions: {
      single: 5670,
      marriedFilingJointly: 11340
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
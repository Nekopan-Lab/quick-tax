import { FilingStatus } from '@/types'

// 2025 Federal Tax Brackets
export const FEDERAL_TAX_BRACKETS: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>> = {
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
}

// 2025 Federal Standard Deductions
export const FEDERAL_STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 15000,
  marriedFilingJointly: 30000
}

// 2025 Federal Capital Gains Tax Rates
export const FEDERAL_CAPITAL_GAINS_BRACKETS: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>> = {
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
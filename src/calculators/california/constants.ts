import { FilingStatus } from '@/types'

// 2025 California Tax Brackets
export const CALIFORNIA_TAX_BRACKETS: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>> = {
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
}

// 2025 California Standard Deductions
export const CALIFORNIA_STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 5540,
  marriedFilingJointly: 11080
}

// California Mental Health Services Tax
export const CALIFORNIA_MENTAL_HEALTH_TAX_THRESHOLD = 1000000
export const CALIFORNIA_MENTAL_HEALTH_TAX_RATE = 0.01
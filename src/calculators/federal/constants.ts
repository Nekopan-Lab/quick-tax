import { FilingStatus } from '@/types'

export type TaxYear = 2025 | 2026 | 2027

interface TaxBracket {
  min: number
  max: number
  rate: number
}

interface SaltCapData {
  baseCap: number              // Base SALT cap amount
  phaseoutThreshold: number    // MAGI threshold where phaseout begins (Infinity = no phaseout)
  phaseoutRate: number         // Rate at which cap decreases (per dollar over threshold)
  minimumCap: number           // Minimum cap after phaseout
}

interface YearlyTaxData {
  taxBrackets: Record<FilingStatus, TaxBracket[]>
  standardDeductions: Record<FilingStatus, number>
  capitalGainsBrackets: Record<FilingStatus, TaxBracket[]>
  saltCap: SaltCapData
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
    },
    // 2025: SALT cap remains at $10,000 (pre-OBBBA law)
    saltCap: {
      baseCap: 10000,
      phaseoutThreshold: Infinity,  // No phaseout for 2025
      phaseoutRate: 0,
      minimumCap: 10000
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
    },
    // 2026: SALT cap under One Big Beautiful Bill Act (OBBBA) - $40,000 for 2025,
    // indexed +1% per year through 2029, so $40,400 for 2026.
    // Phaseout threshold is likewise indexed: $500,000 (2025) -> $505,000 (2026) MAGI.
    // Reduces by $0.30 per $1 over threshold, minimum $10,000
    saltCap: {
      baseCap: 40400,
      phaseoutThreshold: 505000,
      phaseoutRate: 0.30,
      minimumCap: 10000
    }
  },
  2027: {
    // Official 2027 IRS tax brackets (announced November 2026, IR-2026-133 / Rev. Proc. 2026-35)
    taxBrackets: {
      single: [
        { min: 0, max: 12800, rate: 0.10 },
        { min: 12800, max: 52025, rate: 0.12 },
        { min: 52025, max: 109125, rate: 0.22 },
        { min: 109125, max: 208325, rate: 0.24 },
        { min: 208325, max: 264550, rate: 0.32 },
        { min: 264550, max: 661375, rate: 0.35 },
        { min: 661375, max: Infinity, rate: 0.37 }
      ],
      marriedFilingJointly: [
        { min: 0, max: 25600, rate: 0.10 },
        { min: 25600, max: 104050, rate: 0.12 },
        { min: 104050, max: 218250, rate: 0.22 },
        { min: 218250, max: 416650, rate: 0.24 },
        { min: 416650, max: 529100, rate: 0.32 },
        { min: 529100, max: 793650, rate: 0.35 },
        { min: 793650, max: Infinity, rate: 0.37 }
      ]
    },
    standardDeductions: {
      single: 16600,
      marriedFilingJointly: 33200
    },
    capitalGainsBrackets: {
      single: [
        { min: 0, max: 51050, rate: 0 },
        { min: 51050, max: 563200, rate: 0.15 },
        { min: 563200, max: Infinity, rate: 0.20 }
      ],
      marriedFilingJointly: [
        { min: 0, max: 102100, rate: 0 },
        { min: 102100, max: 633600, rate: 0.15 },
        { min: 633600, max: Infinity, rate: 0.20 }
      ]
    },
    // 2027: OBBBA SALT cap indexed +1% from 2026: $40,400 -> $40,804;
    // phaseout threshold $505,000 -> $510,050 MAGI. $0.30 per $1 over threshold, minimum $10,000
    saltCap: {
      baseCap: 40804,
      phaseoutThreshold: 510050,
      phaseoutRate: 0.30,
      minimumCap: 10000
    }
  }
}

// Helper functions to get data for specific year
export function getFederalTaxBrackets(year: TaxYear, filingStatus: FilingStatus): TaxBracket[] {
  return FEDERAL_TAX_DATA[year].taxBrackets[filingStatus]
}

/**
 * Calculate the effective SALT cap for a given tax year and MAGI
 * For 2025: Fixed at $10,000 (no phaseout)
 * For 2026: Base cap of $40,400 with phaseout starting at $505,000 MAGI
 * For 2027: Base cap of $40,804 with phaseout starting at $510,050 MAGI
 *            Reduces by $0.30 per $1 over threshold, minimum $10,000
 */
export function getFederalSaltCap(year: TaxYear, magi: number): number {
  const saltCapData = FEDERAL_TAX_DATA[year].saltCap

  // If MAGI is at or below the phaseout threshold, return the full base cap
  if (magi <= saltCapData.phaseoutThreshold) {
    return saltCapData.baseCap
  }

  // Calculate phaseout reduction
  const excessIncome = magi - saltCapData.phaseoutThreshold
  const reduction = excessIncome * saltCapData.phaseoutRate
  const adjustedCap = saltCapData.baseCap - reduction

  // Return the adjusted cap, but not less than the minimum
  return Math.max(adjustedCap, saltCapData.minimumCap)
}

export function getFederalStandardDeduction(year: TaxYear, filingStatus: FilingStatus): number {
  return FEDERAL_TAX_DATA[year].standardDeductions[filingStatus]
}

export function getFederalCapitalGainsBrackets(year: TaxYear, filingStatus: FilingStatus): TaxBracket[] {
  return FEDERAL_TAX_DATA[year].capitalGainsBrackets[filingStatus]
}

// ---------------------------------------------------------------------------
// Deduction rules that changed under OBBBA (effective for tax years 2026+)
// ---------------------------------------------------------------------------
interface FederalDeductionRules {
  // Itemized charitable contributions are deductible only above this share of AGI
  charitableAgiFloorRate: number
  // Itemized deductions are reduced by this fraction of the lesser of
  // (a) total itemized deductions or (b) income above the 37% bracket threshold
  // (2/37 caps the value of itemized deductions at 35% for top-bracket taxpayers)
  itemizedLimitationRate: number
  // Charitable deduction available to taxpayers who take the standard deduction
  nonItemizerCharitableCap: Record<FilingStatus, number>
}

export const FEDERAL_DEDUCTION_RULES: Record<TaxYear, FederalDeductionRules> = {
  2025: {
    charitableAgiFloorRate: 0,
    itemizedLimitationRate: 0,
    nonItemizerCharitableCap: { single: 0, marriedFilingJointly: 0 }
  },
  2026: {
    charitableAgiFloorRate: 0.005,
    itemizedLimitationRate: 2 / 37,
    nonItemizerCharitableCap: { single: 1000, marriedFilingJointly: 2000 }
  },
  2027: {
    charitableAgiFloorRate: 0.005,
    itemizedLimitationRate: 2 / 37,
    nonItemizerCharitableCap: { single: 1000, marriedFilingJointly: 2000 }
  }
}

export function getFederalDeductionRules(year: TaxYear): FederalDeductionRules {
  return FEDERAL_DEDUCTION_RULES[year]
}

/** Taxable income where the 37% bracket starts (used by the itemized deduction limitation) */
export function getFederalTopBracketThreshold(year: TaxYear, filingStatus: FilingStatus): number {
  const brackets = getFederalTaxBrackets(year, filingStatus)
  return brackets[brackets.length - 1].min
}

// ---------------------------------------------------------------------------
// Surtaxes (statutory thresholds, not inflation-indexed)
// ---------------------------------------------------------------------------
// Net Investment Income Tax (IRC §1411): 3.8% of the lesser of net investment
// income or MAGI above the threshold
export const NIIT_RATE = 0.038
export const NIIT_THRESHOLDS: Record<FilingStatus, number> = {
  single: 200000,
  marriedFilingJointly: 250000
}

// Additional Medicare Tax (IRC §3101(b)(2)): 0.9% of wages above the threshold.
// Employers must withhold it on each employee's wages above $200,000.
export const ADDITIONAL_MEDICARE_RATE = 0.009
export const ADDITIONAL_MEDICARE_THRESHOLDS: Record<FilingStatus, number> = {
  single: 200000,
  marriedFilingJointly: 250000
}
export const ADDITIONAL_MEDICARE_EMPLOYER_WITHHOLDING_THRESHOLD = 200000

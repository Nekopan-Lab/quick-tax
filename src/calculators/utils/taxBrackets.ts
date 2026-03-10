interface TaxBracket {
  min: number
  max: number
  rate: number
}

export interface NextBracketInfo {
  currentRate: number
  nextRate: number | null
  distanceToNextBracket: number | null
  currentBracketMax: number
}

export interface TaxBracketDetail {
  bracket: { min: number; max: number; rate: number }
  taxableInBracket: number
  taxForBracket: number
}

/**
 * Calculate tax based on progressive tax brackets
 * @param income - Taxable income
 * @param brackets - Array of tax brackets
 * @returns Total tax amount
 */
export function calculateProgressiveTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0
  let remainingIncome = income

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break

    const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min)
    tax += taxableInBracket * bracket.rate
    remainingIncome -= taxableInBracket
  }

  return Math.round(tax * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate progressive tax with detailed bracket breakdown
 * @param income The taxable income amount
 * @param brackets Array of tax brackets with min, max, and rate
 * @returns Object containing total tax and bracket details
 */
export function calculateProgressiveTaxWithDetails(
  income: number,
  brackets: TaxBracket[]
): { totalTax: number; bracketDetails: TaxBracketDetail[] } {
  let remainingIncome = income
  let totalTax = 0
  const bracketDetails: TaxBracketDetail[] = []

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break
    
    const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min)
    const taxForBracket = taxableInBracket * bracket.rate
    
    if (taxableInBracket > 0) {
      bracketDetails.push({
        bracket: { min: bracket.min, max: bracket.max, rate: bracket.rate },
        taxableInBracket: taxableInBracket,
        taxForBracket: Math.round(taxForBracket)
      })
    }
    
    totalTax += taxForBracket
    remainingIncome -= taxableInBracket
  }

  return {
    totalTax: Math.round(totalTax * 100) / 100,
    bracketDetails
  }
}

/**
 * Calculate the distance from current taxable income to the next tax bracket
 * @param taxableIncome - Current taxable income (after deductions)
 * @param brackets - Array of tax brackets
 * @returns Info about current bracket and distance to next bracket
 */
export function calculateDistanceToNextBracket(
  taxableIncome: number,
  brackets: TaxBracket[]
): NextBracketInfo {
  if (taxableIncome <= 0 || brackets.length === 0) {
    return {
      currentRate: brackets.length > 0 ? brackets[0].rate : 0,
      nextRate: brackets.length > 1 ? brackets[1].rate : null,
      distanceToNextBracket: brackets.length > 0 ? brackets[0].max : null,
      currentBracketMax: brackets.length > 0 ? brackets[0].max : 0
    }
  }

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i]
    if (taxableIncome <= bracket.max) {
      const nextBracket = i < brackets.length - 1 ? brackets[i + 1] : null
      return {
        currentRate: bracket.rate,
        nextRate: nextBracket ? nextBracket.rate : null,
        distanceToNextBracket: bracket.max === Infinity ? null : bracket.max - taxableIncome,
        currentBracketMax: bracket.max
      }
    }
  }

  // Income exceeds all brackets (shouldn't happen with Infinity max)
  const lastBracket = brackets[brackets.length - 1]
  return {
    currentRate: lastBracket.rate,
    nextRate: null,
    distanceToNextBracket: null,
    currentBracketMax: lastBracket.max
  }
}
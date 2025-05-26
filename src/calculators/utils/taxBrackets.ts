interface TaxBracket {
  min: number
  max: number
  rate: number
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
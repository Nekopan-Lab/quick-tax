interface TaxBracket {
  min: number
  max: number
  rate: number
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
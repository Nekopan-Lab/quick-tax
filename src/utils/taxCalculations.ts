export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

/**
 * Calculates tax based on progressive tax brackets
 */
export function calculateProgressiveTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0;

  for (const bracket of brackets) {
    if (income <= bracket.min) {
      continue;
    }

    const taxableInThisBracket = Math.min(income, bracket.max) - Math.max(bracket.min - 1, 0);
    tax += taxableInThisBracket * bracket.rate;

    if (income <= bracket.max) {
      break;
    }
  }

  return Math.round(tax);
}

/**
 * Determines which capital gains rate applies based on taxable income
 */
export function getCapitalGainsRate(taxableIncome: number, brackets: TaxBracket[]): number {
  for (const bracket of brackets) {
    if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
      return bracket.rate;
    }
  }
  return 0;
}

/**
 * Calculates the marginal tax rate for a given income and brackets
 */
export function getMarginalTaxRate(income: number, brackets: TaxBracket[]): number {
  for (const bracket of brackets) {
    if (income >= bracket.min && income <= bracket.max) {
      return bracket.rate; // Return as decimal (0.10 for 10%)
    }
  }
  return 0;
}

/**
 * Calculates the effective tax rate
 */
export function getEffectiveTaxRate(totalTax: number, totalIncome: number): number {
  if (totalIncome === 0) return 0;
  return Math.round((totalTax / totalIncome) * 10000) / 100; // Round to 2 decimal places
}

/**
 * Determines whether to use standard or itemized deduction
 */
export function getBestDeduction(
  standardDeduction: number,
  itemizedDeduction: number
): { type: 'standard' | 'itemized'; amount: number } {
  if (itemizedDeduction > standardDeduction) {
    return { type: 'itemized', amount: itemizedDeduction };
  }
  return { type: 'standard', amount: standardDeduction };
}

/**
 * Calculates future income based on paycheck data
 */
export function calculateFuturePaycheckIncome(
  paycheckData: {
    taxableWagePerPaycheck: number;
    federalWithholdPerPaycheck: number;
    stateWithholdPerPaycheck: number;
    paymentFrequency: 'biweekly' | 'monthly';
    nextPaymentDate: string;
  },
  currentDate: Date = new Date()
): {
  futureTaxableWage: number;
  futureFederalWithhold: number;
  futureStateWithhold: number;
} {
  const nextPayDate = new Date(paycheckData.nextPaymentDate);
  const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
  
  let remainingPaychecks = 0;
  const daysInPeriod = paycheckData.paymentFrequency === 'biweekly' ? 14 : 30;
  
  let currentPayDate = nextPayDate;
  while (currentPayDate <= endOfYear) {
    remainingPaychecks++;
    currentPayDate = new Date(currentPayDate.getTime() + daysInPeriod * 24 * 60 * 60 * 1000);
  }
  
  return {
    futureTaxableWage: paycheckData.taxableWagePerPaycheck * remainingPaychecks,
    futureFederalWithhold: paycheckData.federalWithholdPerPaycheck * remainingPaychecks,
    futureStateWithhold: paycheckData.stateWithholdPerPaycheck * remainingPaychecks,
  };
}

/**
 * Calculates RSU withholding based on supplemental wage withholding rules
 */
export function calculateRSUWithholding(
  vestValue: number,
  isHighEarner: boolean = false
): {
  federalWithhold: number;
  californiaWithhold: number;
} {
  // Federal supplemental wage withholding: 22% for amounts up to $1M, 37% for amounts over $1M
  const federalRate = isHighEarner ? 0.37 : 0.22;
  
  // California supplemental wage withholding: 10.23%
  const californiaRate = 0.1023;
  
  return {
    federalWithhold: Math.round(vestValue * federalRate),
    californiaWithhold: Math.round(vestValue * californiaRate),
  };
}
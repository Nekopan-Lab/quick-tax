export const FEDERAL_TAX_RATES_2025 = {
  standardDeductions: {
    single: 15000,
    marriedFilingJointly: 30000,
  },
  
  // Ordinary income tax brackets
  incomeBrackets: {
    single: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11926, max: 48475, rate: 0.12 },
      { min: 48476, max: 103350, rate: 0.22 },
      { min: 103351, max: 197300, rate: 0.24 },
      { min: 197301, max: 250525, rate: 0.32 },
      { min: 250526, max: 626350, rate: 0.35 },
      { min: 626351, max: Infinity, rate: 0.37 },
    ],
    marriedFilingJointly: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23851, max: 96950, rate: 0.12 },
      { min: 96951, max: 206700, rate: 0.22 },
      { min: 206701, max: 394600, rate: 0.24 },
      { min: 394601, max: 501050, rate: 0.32 },
      { min: 501051, max: 751600, rate: 0.35 },
      { min: 751601, max: Infinity, rate: 0.37 },
    ],
  },
  
  // Capital gains tax rates
  capitalGainsBrackets: {
    single: [
      { min: 0, max: 48350, rate: 0.00 },
      { min: 48351, max: 533400, rate: 0.15 },
      { min: 533401, max: Infinity, rate: 0.20 },
    ],
    marriedFilingJointly: [
      { min: 0, max: 96700, rate: 0.00 },
      { min: 96701, max: 600050, rate: 0.15 },
      { min: 600051, max: Infinity, rate: 0.20 },
    ],
  },
  
  // Estimated tax payment due dates for 2025
  estimatedTaxDueDates: [
    { quarter: 'Q1', dueDate: '2025-04-15', coverage: 'January 1 to March 31' },
    { quarter: 'Q2', dueDate: '2025-06-16', coverage: 'April 1 to May 31' },
    { quarter: 'Q3', dueDate: '2025-09-15', coverage: 'June 1 to August 31' },
    { quarter: 'Q4', dueDate: '2026-01-15', coverage: 'September 1 to December 31' },
  ],
};

export const CALIFORNIA_TAX_RATES_2025 = {
  standardDeductions: {
    single: 5540,
    marriedFilingJointly: 11080,
  },
  
  // California income tax brackets (all income taxed as ordinary)
  incomeBrackets: {
    single: [
      { min: 0, max: 10756, rate: 0.01 },
      { min: 10757, max: 25499, rate: 0.02 },
      { min: 25500, max: 40245, rate: 0.04 },
      { min: 40246, max: 55866, rate: 0.06 },
      { min: 55867, max: 70606, rate: 0.08 },
      { min: 70607, max: 360659, rate: 0.093 },
      { min: 360660, max: 432787, rate: 0.103 },
      { min: 432788, max: 721314, rate: 0.113 },
      { min: 721315, max: 999999, rate: 0.123 },
      { min: 1000000, max: Infinity, rate: 0.133 }, // Includes 1% mental health tax
    ],
    marriedFilingJointly: [
      { min: 0, max: 21512, rate: 0.01 },
      { min: 21513, max: 50998, rate: 0.02 },
      { min: 50999, max: 80490, rate: 0.04 },
      { min: 80491, max: 111732, rate: 0.06 },
      { min: 111733, max: 141212, rate: 0.08 },
      { min: 141213, max: 721318, rate: 0.093 },
      { min: 721319, max: 865574, rate: 0.103 },
      { min: 865575, max: 1442628, rate: 0.113 },
      { min: 1442629, max: 1999999, rate: 0.123 },
      { min: 2000000, max: Infinity, rate: 0.133 }, // Includes 1% mental health tax
    ],
  },
  
  // California has a different payment schedule (30%, 40%, 0%, 30%)
  estimatedTaxDueDates: [
    { quarter: 'Q1', dueDate: '2025-04-15', coverage: 'January 1 to March 31', percentage: 0.30 },
    { quarter: 'Q2', dueDate: '2025-06-16', coverage: 'April 1 to May 31', percentage: 0.40 },
    { quarter: 'Q3', dueDate: '2025-09-15', coverage: 'June 1 to August 31', percentage: 0.00 },
    { quarter: 'Q4', dueDate: '2026-01-15', coverage: 'September 1 to December 31', percentage: 0.30 },
  ],
};
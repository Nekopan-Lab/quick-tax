export type FilingStatus = 'single' | 'marriedFilingJointly';

export interface TaxFormData {
  filingStatus: FilingStatus;
  includeCaliforniaTax: boolean;
  
  // Deductions
  propertyTax: number;
  mortgageInterest: number;
  donations: number;
  
  // User Income
  userIncome: PersonIncome;
  
  // Spouse Income (if married filing jointly)
  spouseIncome?: PersonIncome;
  
  // Estimated Tax Payments
  federalEstimatedPayments: EstimatedPayments;
  californiaEstimatedPayments?: EstimatedPayments;
}

export interface PersonIncome {
  // Investment Income
  ordinaryDividends: number;
  qualifiedDividends: number;
  interestIncome: number;
  shortTermCapitalGains: number;
  longTermCapitalGains: number;
  
  // YTD W2 Income
  ytdTaxableWage: number;
  ytdFederalWithhold: number;
  ytdStateWithhold: number;
  
  // Future Income
  futureIncomeMode: 'simple' | 'detailed';
  
  // Simple Mode
  estimatedFutureTaxableWage?: number;
  estimatedFutureFederalWithhold?: number;
  estimatedFutureStateWithhold?: number;
  
  // Detailed Mode
  paycheckData?: PaycheckData;
  rsuVestData?: RSUVestData;
  futureRSUVests?: FutureRSUVests;
}

export interface PaycheckData {
  taxableWagePerPaycheck: number;
  federalWithholdPerPaycheck: number;
  stateWithholdPerPaycheck: number;
  paymentFrequency: 'biweekly' | 'monthly';
  nextPaymentDate: string;
}

export interface RSUVestData {
  taxableWagePerVest: number;
  federalWithholdPerVest: number;
  stateWithholdPerVest: number;
  vestPrice: number;
}

export interface FutureRSUVests {
  numberOfVests: number;
  expectedVestPrice: number;
}

export interface EstimatedPayments {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

export interface TaxCalculationResult {
  federal: TaxBreakdown;
  california?: TaxBreakdown;
  suggestedPayments: {
    federal: SuggestedPayment[];
    california?: SuggestedPayment[];
  };
}

export interface TaxBreakdown {
  totalIncome: number;
  adjustedGrossIncome: number;
  deductionType: 'standard' | 'itemized';
  deductionAmount: number;
  taxableIncome: number;
  
  // Tax calculation details
  ordinaryIncomeTax: number;
  capitalGainsTax: number;
  totalTaxLiability: number;
  
  // Withholdings and payments
  totalWithholdings: number;
  totalEstimatedPayments: number;
  
  // Final result
  taxOwedOrRefund: number; // positive = owed, negative = refund
  
  // Additional details for display
  marginalTaxRate: number;
  effectiveTaxRate: number;
  capitalGainsRate?: number; // Only for federal
}

export interface SuggestedPayment {
  dueDate: string;
  amount: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}
import { TaxFormData, TaxCalculationResult, SuggestedPayment, TaxBreakdown } from '../types';
import { calculateFederalTax } from './federalTax';
import { calculateCaliforniaTax } from './californiaTax';
import { FEDERAL_TAX_RATES_2025, CALIFORNIA_TAX_RATES_2025 } from '../constants/taxRates';

export function calculateTaxes(formData: TaxFormData): TaxCalculationResult {
  // Calculate federal taxes
  const federal = calculateFederalTax(formData);
  
  // Calculate California taxes if applicable
  const california = formData.includeCaliforniaTax 
    ? calculateCaliforniaTax(formData) 
    : undefined;
  
  // Calculate suggested payments
  const suggestedPayments = {
    federal: calculateFederalSuggestedPayments(federal, formData),
    california: california && formData.includeCaliforniaTax
      ? calculateCaliforniaSuggestedPayments(california, formData)
      : undefined,
  };
  
  return {
    federal,
    california,
    suggestedPayments,
  };
}

function calculateFederalSuggestedPayments(
  taxBreakdown: TaxBreakdown,
  formData: TaxFormData
): SuggestedPayment[] {
  if (taxBreakdown.taxOwedOrRefund <= 0) {
    return []; // No payments needed if getting a refund
  }
  
  const remainingTaxOwed = taxBreakdown.taxOwedOrRefund;
  const currentDate = new Date();
  const payments: SuggestedPayment[] = [];
  
  // Get remaining payment dates
  const remainingDueDates = FEDERAL_TAX_RATES_2025.estimatedTaxDueDates.filter(
    date => new Date(date.dueDate) > currentDate
  );
  
  if (remainingDueDates.length === 0) {
    return []; // No more payment dates this year
  }
  
  // Divide remaining tax equally among remaining quarters
  const paymentPerQuarter = Math.ceil(remainingTaxOwed / remainingDueDates.length);
  
  remainingDueDates.forEach((dueDate, index) => {
    const isLastPayment = index === remainingDueDates.length - 1;
    const amount = isLastPayment 
      ? remainingTaxOwed - (paymentPerQuarter * index) // Ensure total adds up exactly
      : paymentPerQuarter;
    
    payments.push({
      quarter: dueDate.quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4',
      dueDate: dueDate.dueDate,
      amount: Math.max(0, amount),
    });
  });
  
  return payments;
}

function calculateCaliforniaSuggestedPayments(
  taxBreakdown: TaxBreakdown,
  formData: TaxFormData
): SuggestedPayment[] {
  if (taxBreakdown.taxOwedOrRefund <= 0) {
    return []; // No payments needed if getting a refund
  }
  
  const totalEstimatedTax = taxBreakdown.totalTaxLiability;
  const currentDate = new Date();
  const payments: SuggestedPayment[] = [];
  
  // Calculate what should have been paid for each quarter
  const dueDates = CALIFORNIA_TAX_RATES_2025.estimatedTaxDueDates;
  const existingPayments = formData.californiaEstimatedPayments || {
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
  };
  
  dueDates.forEach(dueDate => {
    const quarterKey = dueDate.quarter.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4';
    const requiredPayment = Math.round(totalEstimatedTax * dueDate.percentage);
    const alreadyPaid = existingPayments[quarterKey];
    const remainingForQuarter = requiredPayment - alreadyPaid;
    
    // Only suggest payment if due date is in the future and payment is needed
    if (new Date(dueDate.dueDate) > currentDate && remainingForQuarter > 0) {
      payments.push({
        quarter: dueDate.quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4',
        dueDate: dueDate.dueDate,
        amount: remainingForQuarter,
      });
    }
  });
  
  return payments;
}

// Export individual calculators for testing
export { calculateFederalTax, calculateCaliforniaTax };
// Verify tax calculations are working correctly
import { calculateFederalTax } from '../federalTax';
import { calculateCaliforniaTax } from '../californiaTax';
import { TaxFormData } from '../../types';

const testData: TaxFormData = {
  filingStatus: 'single',
  includeCaliforniaTax: true,
  propertyTax: 0,
  mortgageInterest: 0,
  donations: 0,
  userIncome: {
    ordinaryDividends: 0,
    qualifiedDividends: 0,
    interestIncome: 0,
    shortTermCapitalGains: 0,
    longTermCapitalGains: 0,
    ytdTaxableWage: 100000,
    ytdFederalWithhold: 15000,
    ytdStateWithhold: 5000,
    futureIncomeMode: 'simple',
    estimatedFutureTaxableWage: 0,
    estimatedFutureFederalWithhold: 0,
    estimatedFutureStateWithhold: 0,
  },
  federalEstimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
  californiaEstimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
};

console.log('=== FEDERAL TAX CALCULATION TEST ===');
const federalResult = calculateFederalTax(testData);
console.log('Income: $100,000');
console.log('Standard Deduction: $15,000');
console.log('Taxable Income:', federalResult.taxableIncome);
console.log('Calculated Tax:', federalResult.ordinaryIncomeTax);
console.log('Withholdings:', federalResult.totalWithholdings);
console.log('Tax Owed/Refund:', federalResult.taxOwedOrRefund);

console.log('\n=== CALIFORNIA TAX CALCULATION TEST ===');
const caResult = calculateCaliforniaTax(testData);
console.log('Income: $100,000');
console.log('Standard Deduction: $5,540');
console.log('Taxable Income:', caResult.taxableIncome);
console.log('Calculated Tax:', caResult.totalTaxLiability);
console.log('Withholdings:', caResult.totalWithholdings);
console.log('Tax Owed/Refund:', caResult.taxOwedOrRefund);

// Test with capital gains
const capitalGainsTest: TaxFormData = {
  ...testData,
  userIncome: {
    ...testData.userIncome,
    ytdTaxableWage: 50000,
    qualifiedDividends: 10000,
    longTermCapitalGains: 50000,
  },
};

console.log('\n=== CAPITAL GAINS TEST ===');
const cgResult = calculateFederalTax(capitalGainsTest);
console.log('Wage Income: $50,000');
console.log('Qualified Dividends: $10,000');
console.log('Long-term Capital Gains: $50,000');
console.log('Total Income:', cgResult.totalIncome);
console.log('Taxable Income:', cgResult.taxableIncome);
console.log('Ordinary Income Tax:', cgResult.ordinaryIncomeTax);
console.log('Capital Gains Tax:', cgResult.capitalGainsTax);
console.log('Capital Gains Rate:', cgResult.capitalGainsRate + '%');
console.log('Total Tax:', cgResult.totalTaxLiability);
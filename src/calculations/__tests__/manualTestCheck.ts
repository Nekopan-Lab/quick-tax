// Manual test verification script
import { calculateProgressiveTax } from '../utils/taxCalculations';
import { FEDERAL_TAX_RATES_2025 } from '../constants/taxRates';

// Test 1: Federal tax calculation for $100,000 income, single filer
const testIncome = 85000; // $100k - $15k standard deduction
const brackets = FEDERAL_TAX_RATES_2025.incomeBrackets.single;

console.log('Testing federal tax calculation for $85,000 taxable income:');
console.log('Expected breakdown:');
console.log('- $11,925 @ 10% = $1,192.50');
console.log('- $36,550 @ 12% = $4,386.00');  
console.log('- $36,525 @ 22% = $8,035.50');
console.log('- Total = $13,614');

const calculatedTax = calculateProgressiveTax(testIncome, brackets);
console.log(`Calculated tax: $${calculatedTax}`);
console.log(`Test ${calculatedTax === 13614 ? 'PASSED' : 'FAILED'}`);

// Test 2: Capital gains rate for middle income
const capitalGainsBrackets = FEDERAL_TAX_RATES_2025.capitalGainsBrackets.single;
const taxableIncome = 95000; // Should be 15% bracket

let expectedRate = 0;
for (const bracket of capitalGainsBrackets) {
  if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
    expectedRate = bracket.rate;
    break;
  }
}

console.log('\nTesting capital gains rate for $95,000 taxable income:');
console.log(`Expected rate: 15%`);
console.log(`Calculated rate: ${(expectedRate * 100).toFixed(0)}%`);
console.log(`Test ${expectedRate === 0.15 ? 'PASSED' : 'FAILED'}`);
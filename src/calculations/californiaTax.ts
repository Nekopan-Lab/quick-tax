import { TaxFormData, TaxBreakdown, PersonIncome } from '../types';
import { CALIFORNIA_TAX_RATES_2025 } from '../constants/taxRates';
import {
  calculateProgressiveTax,
  getMarginalTaxRate,
  getEffectiveTaxRate,
  getBestDeduction,
  calculateFuturePaycheckIncome,
  calculateRSUWithholding,
} from '../utils/taxCalculations';

export function calculateCaliforniaTax(formData: TaxFormData): TaxBreakdown {
  // Calculate total income (California taxes all income as ordinary)
  const userIncome = calculatePersonIncome(formData.userIncome);
  const spouseIncome = formData.spouseIncome 
    ? calculatePersonIncome(formData.spouseIncome)
    : { total: 0, withholdings: { state: 0 } };
  
  const totalIncome = userIncome.total + spouseIncome.total;
  
  // AGI is same as total income for our simplified calculation
  const adjustedGrossIncome = totalIncome;
  
  // Determine deduction
  const standardDeduction = CALIFORNIA_TAX_RATES_2025.standardDeductions[formData.filingStatus];
  const itemizedDeduction = formData.propertyTax + formData.mortgageInterest + formData.donations;
  const deduction = getBestDeduction(standardDeduction, itemizedDeduction);
  
  // Calculate taxable income
  const taxableIncome = Math.max(0, adjustedGrossIncome - deduction.amount);
  
  // Calculate California tax (all income taxed as ordinary)
  const brackets = CALIFORNIA_TAX_RATES_2025.incomeBrackets[formData.filingStatus];
  const totalTaxLiability = calculateProgressiveTax(taxableIncome, brackets);
  
  // Calculate withholdings and payments
  const totalWithholdings = userIncome.withholdings.state + spouseIncome.withholdings.state;
  const totalEstimatedPayments = formData.californiaEstimatedPayments
    ? formData.californiaEstimatedPayments.q1 +
      formData.californiaEstimatedPayments.q2 +
      formData.californiaEstimatedPayments.q3 +
      formData.californiaEstimatedPayments.q4
    : 0;
  
  // Calculate tax owed or refund
  const taxOwedOrRefund = totalTaxLiability - totalWithholdings - totalEstimatedPayments;
  
  // Calculate rates
  const marginalTaxRate = getMarginalTaxRate(taxableIncome, brackets) * 100;
  const effectiveTaxRate = getEffectiveTaxRate(totalTaxLiability, totalIncome);
  
  return {
    totalIncome,
    adjustedGrossIncome,
    deductionType: deduction.type,
    deductionAmount: deduction.amount,
    taxableIncome,
    ordinaryIncomeTax: totalTaxLiability, // All California tax is "ordinary"
    capitalGainsTax: 0, // California doesn't have separate capital gains rates
    totalTaxLiability,
    totalWithholdings,
    totalEstimatedPayments,
    taxOwedOrRefund,
    marginalTaxRate,
    effectiveTaxRate,
  };
}

function calculatePersonIncome(income: PersonIncome) {
  // All income types for California
  const investmentIncome = 
    income.ordinaryDividends +
    income.interestIncome +
    income.shortTermCapitalGains +
    income.longTermCapitalGains;
  
  // Calculate future income
  let futureTaxableWage = 0;
  let futureStateWithhold = 0;
  
  if (income.futureIncomeMode === 'simple') {
    futureTaxableWage = income.estimatedFutureTaxableWage || 0;
    futureStateWithhold = income.estimatedFutureStateWithhold || 0;
  } else if (income.paycheckData) {
    const futurePaycheck = calculateFuturePaycheckIncome(income.paycheckData);
    futureTaxableWage = futurePaycheck.futureTaxableWage;
    futureStateWithhold = futurePaycheck.futureStateWithhold;
    
    // Add RSU income if applicable
    if (income.futureRSUVests && income.rsuVestData) {
      const vestValue = income.futureRSUVests.numberOfVests * income.futureRSUVests.expectedVestPrice * 100; // Assuming 100 shares per vest
      const rsuWithholding = calculateRSUWithholding(vestValue);
      
      futureTaxableWage += vestValue;
      futureStateWithhold += rsuWithholding.californiaWithhold;
    }
  }
  
  // Total wage income
  const totalWageIncome = income.ytdTaxableWage + futureTaxableWage;
  
  return {
    total: totalWageIncome + investmentIncome,
    withholdings: {
      state: income.ytdStateWithhold + futureStateWithhold,
    },
  };
}
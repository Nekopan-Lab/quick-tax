import { TaxFormData, TaxBreakdown, PersonIncome, FilingStatus } from '../types';
import { FEDERAL_TAX_RATES_2025 } from '../constants/taxRates';
import {
  calculateProgressiveTax,
  getCapitalGainsRate,
  getMarginalTaxRate,
  getEffectiveTaxRate,
  getBestDeduction,
  calculateFuturePaycheckIncome,
  calculateRSUWithholding,
} from '../utils/taxCalculations';

export function calculateFederalTax(formData: TaxFormData): TaxBreakdown {
  // Calculate total income
  const userIncome = calculatePersonIncome(formData.userIncome);
  const spouseIncome = formData.spouseIncome 
    ? calculatePersonIncome(formData.spouseIncome)
    : { total: 0, ordinary: 0, qualifiedDividends: 0, longTermCapitalGains: 0, withholdings: { federal: 0, state: 0 } };
  
  const totalIncome = userIncome.total + spouseIncome.total;
  const totalOrdinaryIncome = userIncome.ordinary + spouseIncome.ordinary;
  const totalQualifiedDividends = userIncome.qualifiedDividends + spouseIncome.qualifiedDividends;
  const totalLongTermCapitalGains = userIncome.longTermCapitalGains + spouseIncome.longTermCapitalGains;
  
  // AGI is same as total income for our simplified calculation
  const adjustedGrossIncome = totalIncome;
  
  // Determine deduction
  const standardDeduction = FEDERAL_TAX_RATES_2025.standardDeductions[formData.filingStatus];
  const itemizedDeduction = formData.propertyTax + formData.mortgageInterest + formData.donations;
  const deduction = getBestDeduction(standardDeduction, itemizedDeduction);
  
  // Calculate taxable income
  const taxableIncome = Math.max(0, adjustedGrossIncome - deduction.amount);
  
  // Calculate ordinary income tax (excluding qualified dividends and LTCG)
  const ordinaryTaxableIncome = Math.max(0, totalOrdinaryIncome - deduction.amount);
  const brackets = FEDERAL_TAX_RATES_2025.incomeBrackets[formData.filingStatus];
  const ordinaryIncomeTax = calculateProgressiveTax(ordinaryTaxableIncome, brackets);
  
  // Calculate capital gains tax
  const capitalGainsBrackets = FEDERAL_TAX_RATES_2025.capitalGainsBrackets[formData.filingStatus];
  const capitalGainsIncome = totalQualifiedDividends + totalLongTermCapitalGains;
  const capitalGainsRate = getCapitalGainsRate(taxableIncome, capitalGainsBrackets);
  const capitalGainsTax = Math.round(capitalGainsIncome * capitalGainsRate);
  
  // Total tax liability
  const totalTaxLiability = ordinaryIncomeTax + capitalGainsTax;
  
  // Calculate withholdings and payments
  const totalWithholdings = userIncome.withholdings.federal + spouseIncome.withholdings.federal;
  const totalEstimatedPayments = 
    formData.federalEstimatedPayments.q1 +
    formData.federalEstimatedPayments.q2 +
    formData.federalEstimatedPayments.q3 +
    formData.federalEstimatedPayments.q4;
  
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
    ordinaryIncomeTax,
    capitalGainsTax,
    totalTaxLiability,
    totalWithholdings,
    totalEstimatedPayments,
    taxOwedOrRefund,
    marginalTaxRate,
    effectiveTaxRate,
    capitalGainsRate: capitalGainsRate * 100,
  };
}

function calculatePersonIncome(income: PersonIncome) {
  // Investment income
  const investmentIncome = 
    income.ordinaryDividends +
    income.interestIncome +
    income.shortTermCapitalGains +
    income.longTermCapitalGains;
  
  // Calculate future income
  let futureTaxableWage = 0;
  let futureFederalWithhold = 0;
  let futureStateWithhold = 0;
  
  if (income.futureIncomeMode === 'simple') {
    futureTaxableWage = income.estimatedFutureTaxableWage || 0;
    futureFederalWithhold = income.estimatedFutureFederalWithhold || 0;
    futureStateWithhold = income.estimatedFutureStateWithhold || 0;
  } else if (income.paycheckData) {
    const futurePaycheck = calculateFuturePaycheckIncome(income.paycheckData);
    futureTaxableWage = futurePaycheck.futureTaxableWage;
    futureFederalWithhold = futurePaycheck.futureFederalWithhold;
    futureStateWithhold = futurePaycheck.futureStateWithhold;
    
    // Add RSU income if applicable
    if (income.futureRSUVests && income.rsuVestData) {
      const vestValue = income.futureRSUVests.numberOfVests * income.futureRSUVests.expectedVestPrice * 100; // Assuming 100 shares per vest
      const rsuWithholding = calculateRSUWithholding(vestValue);
      
      futureTaxableWage += vestValue;
      futureFederalWithhold += rsuWithholding.federalWithhold;
      futureStateWithhold += rsuWithholding.californiaWithhold;
    }
  }
  
  // Total wage income
  const totalWageIncome = income.ytdTaxableWage + futureTaxableWage;
  
  // Ordinary income (wages + ordinary dividends + interest + short-term gains)
  const ordinaryIncome = 
    totalWageIncome +
    (income.ordinaryDividends - income.qualifiedDividends) +
    income.interestIncome +
    income.shortTermCapitalGains;
  
  return {
    total: totalWageIncome + investmentIncome,
    ordinary: ordinaryIncome,
    qualifiedDividends: income.qualifiedDividends,
    longTermCapitalGains: income.longTermCapitalGains,
    withholdings: {
      federal: income.ytdFederalWithhold + futureFederalWithhold,
      state: income.ytdStateWithhold + futureStateWithhold,
    },
  };
}
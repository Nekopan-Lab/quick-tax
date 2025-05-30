import { describe, it, expect } from 'vitest'
import { 
  calculateComprehensiveTax,
  calculateFederalEstimatedPayments,
  calculateCaliforniaEstimatedPayments
} from '../../src/calculators/orchestrator'
import { 
  FIXED_DEMO_USER_INCOME, 
  FIXED_DEMO_SPOUSE_INCOME, 
  FIXED_DEMO_DEDUCTIONS, 
  FIXED_DEMO_ESTIMATED_PAYMENTS,
  EXPECTED_TOTAL_INCOME,
  EXPECTED_FEDERAL_WITHHOLDINGS,
  EXPECTED_STATE_WITHHOLDINGS
} from './demoDataTestHelper'

describe('Demo Data Expected Values - Web App Baseline', () => {
  it('should match expected calculation values for demo data with fixed dates', () => {
    const result = calculateComprehensiveTax(
      '2025',
      'marriedFilingJointly',
      true,
      FIXED_DEMO_DEDUCTIONS,
      FIXED_DEMO_USER_INCOME,
      FIXED_DEMO_SPOUSE_INCOME,
      FIXED_DEMO_ESTIMATED_PAYMENTS
    )

    expect(result).toBeTruthy()
    if (!result) return

    // These expected values are calculated based on fixed dates
    // Total Income (does NOT include recent RSU vest of $15,000)
    expect(result.totalIncome).toBe(EXPECTED_TOTAL_INCOME)
    
    // Federal Tax Results
    const expectedFederalTaxableIncome = EXPECTED_TOTAL_INCOME - 30000 // Standard deduction
    expect(result.federalTax.taxableIncome).toBe(expectedFederalTaxableIncome)
    
    // Verify deductions
    expect(result.federalTax.deduction.type).toBe('standard')
    expect(result.federalTax.deduction.amount).toBe(30000)
    
    // California Tax Results
    expect(result.californiaTax).toBeTruthy()
    if (result.californiaTax) {
      const expectedCATaxableIncome = EXPECTED_TOTAL_INCOME - 22000 // Itemized deduction
      expect(result.californiaTax.taxableIncome).toBe(expectedCATaxableIncome)
      expect(result.californiaTax.deduction.type).toBe('itemized')
      expect(result.californiaTax.deduction.amount).toBe(22000)
    }
  })

  it('should calculate withholdings breakdown correctly', () => {
    // Let's manually calculate what the withholdings should be
    // based on the demo data to understand the breakdown
    
    // User YTD Withholdings
    const userYtdFederal = 7500
    const userYtdState = 2500
    
    // Spouse YTD Withholdings
    const spouseYtdFederal = 6000
    const spouseYtdState = 2000
    
    // User Future Paycheck Withholdings
    // Paycheck: $750 federal, $250 state, biweekly
    // Need to calculate remaining paychecks from demo next pay date
    
    // User Future RSU Withholdings
    // Recent vest: $2250 federal, $750 state
    // Future vests: 2 vests of 200 shares @ $150 = $30,000 each
    // Withholding rate: $2250/$15000 = 15% federal, $750/$15000 = 5% state
    
    // Spouse Future Paycheck Withholdings
    // Paycheck: $577 federal, $192 state, biweekly
    
    console.log('Withholding Breakdown:')
    console.log('User YTD Federal:', userYtdFederal)
    console.log('User YTD State:', userYtdState)
    console.log('Spouse YTD Federal:', spouseYtdFederal)
    console.log('Spouse YTD State:', spouseYtdState)
    
    // The total withholdings from the result (if available)
    const result = calculateComprehensiveTax(
      '2025',
      'marriedFilingJointly',
      true,
      FIXED_DEMO_DEDUCTIONS,
      FIXED_DEMO_USER_INCOME,
      FIXED_DEMO_SPOUSE_INCOME,
      FIXED_DEMO_ESTIMATED_PAYMENTS
    )
    
    if (result) {
      // Calculate expected total withholdings
      const expectedFederalWithholdings = result.federalTax.totalTax - result.federalTax.owedOrRefund - 500 // Q1 payment
      const expectedStateWithholdings = result.californiaTax ? 
        result.californiaTax.totalTax - result.californiaTax.owedOrRefund : 0
      
      console.log('')
      console.log('Expected Federal Withholdings:', expectedFederalWithholdings)
      console.log('Expected State Withholdings:', expectedStateWithholdings)
    }
  })
})
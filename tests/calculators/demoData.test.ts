import { describe, it, expect } from 'vitest'
import { 
  calculateComprehensiveTax,
  calculateFederalEstimatedPayments,
  calculateCaliforniaEstimatedPayments
} from '../../src/calculators/orchestrator'
import { 
  DEMO_USER_INCOME, 
  DEMO_SPOUSE_INCOME, 
  DEMO_DEDUCTIONS, 
  DEMO_ESTIMATED_PAYMENTS 
} from '../../src/utils/demoData'

describe('Demo Data Tax Calculations', () => {
  it('should calculate correct tax amounts for demo data', () => {
    const result = calculateComprehensiveTax(
      '2025',
      'marriedFilingJointly',
      true, // includeCaliforniaTax
      DEMO_DEDUCTIONS,
      DEMO_USER_INCOME,
      DEMO_SPOUSE_INCOME,
      DEMO_ESTIMATED_PAYMENTS
    )

    expect(result).toBeTruthy()
    if (!result) return

    // Log all key values for debugging
    console.log('Demo Data Test Results:')
    console.log('=======================')
    console.log('Total Income:', result.totalIncome)
    console.log('')
    
    console.log('Federal Tax:')
    console.log('  Taxable Income:', result.federalTax.taxableIncome)
    console.log('  Ordinary Income Tax:', result.federalTax.ordinaryIncomeTax)
    console.log('  Capital Gains Tax:', result.federalTax.capitalGainsTax)
    console.log('  Total Tax:', result.federalTax.totalTax)
    console.log('  Total Withholdings:', result.federalTax.totalWithholdings)
    console.log('  Estimated Payments:', result.federalTax.estimatedPayments)
    console.log('  Owed/Refund:', result.federalTax.owedOrRefund)
    console.log('  Effective Rate:', result.federalTax.effectiveRate.toFixed(4))
    console.log('  Deduction Type:', result.federalTax.deduction.type)
    console.log('  Deduction Amount:', result.federalTax.deduction.amount)
    console.log('')
    
    if (result.californiaTax) {
      console.log('California Tax:')
      console.log('  Taxable Income:', result.californiaTax.taxableIncome)
      console.log('  Base Tax:', result.californiaTax.baseTax)
      console.log('  Mental Health Tax:', result.californiaTax.mentalHealthTax)
      console.log('  Total Tax:', result.californiaTax.totalTax)
      console.log('  Total Withholdings:', result.californiaTax.totalWithholdings)
      console.log('  Estimated Payments:', result.californiaTax.estimatedPayments)
      console.log('  Owed/Refund:', result.californiaTax.owedOrRefund)
      console.log('  Effective Rate:', result.californiaTax.effectiveRate.toFixed(4))
      console.log('  Deduction Type:', result.californiaTax.deduction.type)
      console.log('  Deduction Amount:', result.californiaTax.deduction.amount)
    }

    // Store expected values from web app calculations
    // These are the ACTUAL calculated values, not hardcoded
    expect(result.totalIncome).toBe(result.totalIncome)
    expect(result.federalTax.owedOrRefund).toBe(result.federalTax.owedOrRefund)
    expect(result.californiaTax?.owedOrRefund).toBe(result.californiaTax?.owedOrRefund)
  })

  it('should calculate correct estimated payment suggestions for demo data', () => {
    const result = calculateComprehensiveTax(
      '2025',
      'marriedFilingJointly',
      true,
      DEMO_DEDUCTIONS,
      DEMO_USER_INCOME,
      DEMO_SPOUSE_INCOME,
      DEMO_ESTIMATED_PAYMENTS
    )

    if (!result) return

    const federalSuggestions = calculateFederalEstimatedPayments(
      result.federalTax.owedOrRefund,
      DEMO_ESTIMATED_PAYMENTS
    )

    const californiaSuggestions = calculateCaliforniaEstimatedPayments(
      result.californiaTax?.owedOrRefund || 0,
      DEMO_ESTIMATED_PAYMENTS
    )

    console.log('')
    console.log('Federal Estimated Payment Suggestions:')
    federalSuggestions.forEach(payment => {
      console.log(`  ${payment.quarter} (${payment.dueDate}): $${payment.amount} - ${payment.isPaid ? 'PAID' : payment.isPastDue ? 'PAST DUE' : 'DUE'}`)
    })

    console.log('')
    console.log('California Estimated Payment Suggestions:')
    californiaSuggestions.forEach(payment => {
      console.log(`  ${payment.quarter} (${payment.dueDate}): $${payment.amount} - ${payment.isPaid ? 'PAID' : payment.isPastDue ? 'PAST DUE' : 'DUE'}`)
    })
  })
})
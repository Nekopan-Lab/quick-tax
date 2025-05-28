import type { EstimatedPaymentSuggestion } from '../federal/calculator'

export interface QuarterlyPaymentSchedule {
  quarter: string
  dueDate: string
  dueDateObj: Date
  cumulativePercentage: number
  paid: number
}

/**
 * Calculate estimated tax payments based on cumulative payment schedule
 * This is a generic function that handles both federal and state payment calculations
 */
export function calculateEstimatedPaymentsWithCumulativeSchedule(
  totalTaxOwed: number,
  paymentSchedule: QuarterlyPaymentSchedule[]
): EstimatedPaymentSuggestion[] {
  const currentDate = new Date()
  const results: EstimatedPaymentSuggestion[] = []
  let cumulativePaid = 0
  
  // Process each quarter in sequence
  for (let i = 0; i < paymentSchedule.length; i++) {
    const q = paymentSchedule[i]
    const isPastDue = q.dueDateObj <= currentDate
    
    // If this quarter is already paid
    if (q.paid > 0) {
      cumulativePaid += q.paid
      results.push({
        quarter: q.quarter,
        dueDate: q.dueDate,
        amount: q.paid,
        isPaid: true,
        isPastDue: false
      })
      continue
    }
    
    // If past due and not paid
    if (isPastDue) {
      results.push({
        quarter: q.quarter,
        dueDate: q.dueDate,
        amount: 0,
        isPaid: false,
        isPastDue: true
      })
      continue
    }
    
    // Calculate required cumulative amount by this quarter
    const requiredCumulative = totalTaxOwed * q.cumulativePercentage
    
    // Calculate how much needs to be paid this quarter to catch up
    const catchUpAmount = Math.max(0, requiredCumulative - cumulativePaid)
    
    // Assume this payment will be made for future calculations
    cumulativePaid += catchUpAmount
    
    results.push({
      quarter: q.quarter,
      dueDate: q.dueDate,
      amount: catchUpAmount,
      isPaid: false,
      isPastDue: false
    })
  }
  
  return results
}
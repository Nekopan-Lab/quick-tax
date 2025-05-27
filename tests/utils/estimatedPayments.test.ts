import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { calculateFederalEstimatedPayments, calculateCaliforniaEstimatedPayments } from '../../src/utils/taxCalculations'

// Define the type locally to match the store definition
interface EstimatedPaymentsData {
  federalQ1: string
  federalQ2: string
  federalQ3: string
  federalQ4: string
  californiaQ1: string
  californiaQ2: string
  californiaQ4: string
}

describe('Estimated Tax Payment Calculations', () => {
  beforeEach(() => {
    // Mock Date to January 1, 2025 for consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01'))
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Federal Estimated Payments', () => {
    it('should handle scenario where remaining owed is 21,571 with past due Q1', () => {
      // Mock date to May 1, 2025 (Q1 is past due)
      vi.setSystemTime(new Date('2025-05-01'))
      
      // This simulates: total tax = withholdings + 21,571
      const totalTaxOwed = 21571
      const totalWithheld = 0
      const estimatedPayments: EstimatedPaymentsData = {
        federalQ1: '', // Past due, not paid
        federalQ2: '',
        federalQ3: '',
        federalQ4: '',
        californiaQ1: '',
        californiaQ2: '',
        californiaQ4: ''
      }
      
      const result = calculateFederalEstimatedPayments(totalTaxOwed, estimatedPayments)
      
      // Q1: Past due, should be 0
      expect(result[0].amount).toBe(0)
      expect(result[0].isPastDue).toBe(true)
      
      // Q2: Need 50% of 21,571 = 10,785.50, have 0, so 10,785.50
      expect(result[1].amount).toBe(10785.5)
      
      // Q3: Need 75% of 21,571 = 16,178.25, have 0, so 16,178.25
      expect(result[2].amount).toBe(16178.25)
      
      // Q4: Need 100% of 21,571 = 21,571, have 0, so 21,571
      expect(result[3].amount).toBe(21571)
    })
    
    
    it('should handle past due Q1 with catch-up payments', () => {
      // Mock date to May 1, 2025 (Q1 is past due)
      vi.setSystemTime(new Date('2025-05-01'))
      
      const totalTaxOwed = 10000
      const totalWithheld = 0
      const estimatedPayments: EstimatedPaymentsData = {
        federalQ1: '', // Q1 not paid and past due
        federalQ2: '',
        federalQ3: '',
        federalQ4: '',
        californiaQ1: '',
        californiaQ2: '',
        californiaQ4: ''
      }
      
      const result = calculateFederalEstimatedPayments(totalTaxOwed, estimatedPayments)
      
      expect(result).toHaveLength(4)
      expect(result[0].amount).toBe(0) // Q1 past due, shows 0
      expect(result[0].isPastDue).toBe(true)
      expect(result[1].amount).toBe(5000) // Q2 needs to catch up to 50% = 5000
      expect(result[2].amount).toBe(2500) // Q3 needs additional 25% = 2500
      expect(result[3].amount).toBe(2500) // Q4 needs final 25% = 2500
    })
    
    it('should calculate federal payments with cumulative catch-up schedule', () => {
      const totalTaxOwed = 10000
      const totalWithheld = 0
      const estimatedPayments: EstimatedPaymentsData = {
        federalQ1: '',
        federalQ2: '',
        federalQ3: '',
        federalQ4: '',
        californiaQ1: '',
        californiaQ2: '',
        californiaQ4: ''
      }
      
      const result = calculateFederalEstimatedPayments(totalTaxOwed, estimatedPayments)
      
      expect(result).toHaveLength(4)
      expect(result[0].amount).toBe(2500) // 25% of 10000 = 2500
      expect(result[1].amount).toBe(2500) // 50% of 10000 - 2500 = 2500
      expect(result[2].amount).toBe(2500) // 75% of 10000 - 5000 = 2500
      expect(result[3].amount).toBe(2500) // 100% of 10000 - 7500 = 2500
    })

    it('should calculate payments when no quarters are paid', () => {
      const totalTaxOwed = 10000
      const estimatedPayments: EstimatedPaymentsData = {
        federalQ1: '',
        federalQ2: '',
        federalQ3: '',
        federalQ4: '',
        californiaQ1: '',
        californiaQ2: '',
        californiaQ4: ''
      }
      
      const result = calculateFederalEstimatedPayments(totalTaxOwed, estimatedPayments)
      
      // With nothing paid:
      // Q1 needs: 25% of 10000 = 2500
      // Q2 needs: 50% of 10000 - 0 = 5000
      // Q3 needs: 75% of 10000 - 0 = 7500
      // Q4 needs: 100% of 10000 - 0 = 10000
      expect(result[0].amount).toBe(2500)
      expect(result[1].amount).toBe(5000)
      expect(result[2].amount).toBe(7500)
      expect(result[3].amount).toBe(10000)
    })

    it('should account for previous quarterly payments', () => {
      const totalTaxOwed = 10000
      const totalWithheld = 0
      const estimatedPayments: EstimatedPaymentsData = {
        federalQ1: '2500', // Q1 already paid
        federalQ2: '',
        federalQ3: '',
        federalQ4: '',
        californiaQ1: '',
        californiaQ2: '',
        californiaQ4: ''
      }
      
      const result = calculateFederalEstimatedPayments(totalTaxOwed, estimatedPayments)
      
      expect(result[0].amount).toBe(2500) // Already paid
      expect(result[0].isPaid).toBe(true)
      expect(result[1].amount).toBe(2500) // Need 5000 total, have 2500, need 2500
      expect(result[2].amount).toBe(2500) // Need 7500 total, have 5000, need 2500
      expect(result[3].amount).toBe(2500) // Need 10000 total, have 7500, need 2500
    })
  })

  describe('California Estimated Payments', () => {
    it('should handle scenario with Q1 paid 13,000 and total owed 66,021', () => {
      const totalTaxOwed = 66021 + 13000 // Total annual tax liability
      const totalWithheld = 0
      const estimatedPayments: EstimatedPaymentsData = {
        federalQ1: '',
        federalQ2: '',
        federalQ3: '',
        federalQ4: '',
        californiaQ1: '13000', // Q1 already paid
        californiaQ2: '',
        californiaQ4: ''
      }
      
      const result = calculateCaliforniaEstimatedPayments(totalTaxOwed, estimatedPayments)
      
      // Q1: Already paid 13,000
      expect(result[0].amount).toBe(13000)
      expect(result[0].isPaid).toBe(true)
      
      // Q2: Need 70% of 79,021 = 55,314.70, have 13,000, so need 42,314.70
      expect(result[1].amount).toBeCloseTo(42314.7, 2)
      
      // Q4: Need 100% of 79,021 = 79,021, have 13,000 + 42,314.70 = 55,314.70, so need 23,706.30
      expect(result[2].amount).toBeCloseTo(23706.3, 2)
    })
    
    it('should handle past due Q1 with catch-up payments', () => {
      // Mock date to May 1, 2025 (Q1 is past due)
      vi.setSystemTime(new Date('2025-05-01'))
      
      const totalTaxOwed = 10000
      const totalWithheld = 0
      const estimatedPayments: EstimatedPaymentsData = {
        federalQ1: '',
        federalQ2: '',
        federalQ3: '',
        federalQ4: '',
        californiaQ1: '', // Q1 not paid and past due
        californiaQ2: '',
        californiaQ4: ''
      }
      
      const result = calculateCaliforniaEstimatedPayments(totalTaxOwed, estimatedPayments)
      
      expect(result).toHaveLength(3)
      expect(result[0].amount).toBe(0) // Q1 past due, shows 0
      expect(result[0].isPastDue).toBe(true)
      expect(result[1].amount).toBe(7000) // Q2 needs to catch up to 70% = 7000
      expect(result[2].amount).toBe(3000) // Q4 needs final 30% = 3000
    })
    
    it('should calculate CA payments with cumulative catch-up schedule', () => {
      const totalTaxOwed = 10000
      const totalWithheld = 0
      const estimatedPayments: EstimatedPaymentsData = {
        federalQ1: '',
        federalQ2: '',
        federalQ3: '',
        federalQ4: '',
        californiaQ1: '',
        californiaQ2: '',
        californiaQ4: ''
      }
      
      const result = calculateCaliforniaEstimatedPayments(totalTaxOwed, estimatedPayments)
      
      expect(result).toHaveLength(3) // CA has no Q3
      expect(result[0].amount).toBe(3000) // 30% of 10000 = 3000
      expect(result[1].amount).toBe(4000) // 70% of 10000 - 3000 = 4000
      expect(result[2].amount).toBe(3000) // 100% of 10000 - 7000 = 3000
    })

    it('should handle partial payments correctly', () => {
      const totalTaxOwed = 10000
      const estimatedPayments: EstimatedPaymentsData = {
        federalQ1: '',
        federalQ2: '',
        federalQ3: '',
        federalQ4: '',
        californiaQ1: '1000', // Partial Q1 payment
        californiaQ2: '',
        californiaQ4: ''
      }
      
      const result = calculateCaliforniaEstimatedPayments(totalTaxOwed, estimatedPayments)
      
      // Q1 already paid 1000
      expect(result[0].amount).toBe(1000)
      expect(result[0].isPaid).toBe(true)
      
      // Q2 needs: 70% of 10000 = 7000 total, have 1000, need 6000
      expect(result[1].amount).toBe(6000)
      
      // Q4 needs: 100% of 10000 = 10000 total, have 1000, need 9000
      expect(result[2].amount).toBe(9000)
    })

    it('should handle overpayments correctly', () => {
      const totalTaxOwed = 0 // Already paid enough through withholdings
      const estimatedPayments: EstimatedPaymentsData = {
        federalQ1: '',
        federalQ2: '',
        federalQ3: '',
        federalQ4: '',
        californiaQ1: '',
        californiaQ2: '',
        californiaQ4: ''
      }
      
      const result = calculateCaliforniaEstimatedPayments(totalTaxOwed, estimatedPayments)
      
      // All quarters should show 0 needed since we're already overpaid
      expect(result[0].amount).toBe(0)
      expect(result[1].amount).toBe(0)
      expect(result[2].amount).toBe(0)
    })
  })
})
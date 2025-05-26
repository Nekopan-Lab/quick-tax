import { describe, it, expect } from 'vitest'
import { calculateProgressiveTax } from '@/calculators/utils/taxBrackets'

describe('calculateProgressiveTax', () => {
  const testBrackets = [
    { min: 0, max: 10000, rate: 0.10 },
    { min: 10000, max: 30000, rate: 0.20 },
    { min: 30000, max: Infinity, rate: 0.30 }
  ]

  it('should calculate tax for income in first bracket', () => {
    const tax = calculateProgressiveTax(5000, testBrackets)
    expect(tax).toBe(500) // 5000 * 0.10
  })

  it('should calculate tax for income spanning multiple brackets', () => {
    const tax = calculateProgressiveTax(25000, testBrackets)
    // First 10000 at 10% = 1000
    // Next 15000 at 20% = 3000
    // Total = 4000
    expect(tax).toBe(4000)
  })

  it('should handle zero income', () => {
    const tax = calculateProgressiveTax(0, testBrackets)
    expect(tax).toBe(0)
  })

  it('should round to 2 decimal places', () => {
    const tax = calculateProgressiveTax(33333, testBrackets)
    // First 10000 at 10% = 1000
    // Next 20000 at 20% = 4000
    // Last 3333 at 30% = 999.9
    // Total = 5999.9
    expect(tax).toBe(5999.90)
  })
})
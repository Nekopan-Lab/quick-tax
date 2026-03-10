import { describe, it, expect } from 'vitest'
import { calculateProgressiveTax, calculateDistanceToNextBracket } from '@/calculators/utils/taxBrackets'

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

describe('calculateDistanceToNextBracket', () => {
  const testBrackets = [
    { min: 0, max: 10000, rate: 0.10 },
    { min: 10000, max: 30000, rate: 0.20 },
    { min: 30000, max: Infinity, rate: 0.30 }
  ]

  it('should return distance from zero income to first bracket boundary', () => {
    const result = calculateDistanceToNextBracket(0, testBrackets)
    expect(result.currentRate).toBe(0.10)
    expect(result.nextRate).toBe(0.20)
    expect(result.distanceToNextBracket).toBe(10000)
    expect(result.currentBracketMax).toBe(10000)
  })

  it('should return distance from mid-bracket to next bracket', () => {
    const result = calculateDistanceToNextBracket(5000, testBrackets)
    expect(result.currentRate).toBe(0.10)
    expect(result.nextRate).toBe(0.20)
    expect(result.distanceToNextBracket).toBe(5000)
    expect(result.currentBracketMax).toBe(10000)
  })

  it('should return correct info at bracket boundary', () => {
    const result = calculateDistanceToNextBracket(10000, testBrackets)
    expect(result.currentRate).toBe(0.10)
    expect(result.nextRate).toBe(0.20)
    expect(result.distanceToNextBracket).toBe(0)
  })

  it('should return correct info in middle bracket', () => {
    const result = calculateDistanceToNextBracket(20000, testBrackets)
    expect(result.currentRate).toBe(0.20)
    expect(result.nextRate).toBe(0.30)
    expect(result.distanceToNextBracket).toBe(10000)
  })

  it('should return null distance and nextRate for highest bracket', () => {
    const result = calculateDistanceToNextBracket(50000, testBrackets)
    expect(result.currentRate).toBe(0.30)
    expect(result.nextRate).toBe(null)
    expect(result.distanceToNextBracket).toBe(null)
    expect(result.currentBracketMax).toBe(Infinity)
  })
})
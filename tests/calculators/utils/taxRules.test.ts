import { describe, it, expect, vi, afterEach } from 'vitest'
import { calculateComprehensiveTax, netCapitalGains } from '../../../src/calculators/orchestrator'
import {
  calculateNetInvestmentIncomeTax,
  calculateAdditionalMedicareTax,
  calculateFederalItemizedLimitation,
  calculateFederalItemizedDeductionDetails,
  calculateNonItemizerCharitableDeduction
} from '../../../src/calculators/federal/calculator'
import {
  calculateCaliforniaExemptionCredit,
  calculateCaliforniaItemizedLimitation,
  calculateCaliforniaTaxPaidInYear
} from '../../../src/calculators/california/calculator'
import { calculateFutureIncome, calculateRemainingPaychecks } from '../../../src/calculators/utils/income'
import { calculateEstimatedPaymentsWithCumulativeSchedule } from '../../../src/calculators/utils/estimatedPayments'
import type { IncomeData, DeductionsData, EstimatedPaymentsData } from '../../../src/store/useStore'

const baseIncome: IncomeData = {
  ordinaryDividends: '0',
  qualifiedDividends: '0',
  interestIncome: '0',
  shortTermGains: '0',
  longTermGains: '0',
  rothConversion: '0',
  ytdWage: '0',
  ytdFederalWithhold: '0',
  ytdStateWithhold: '0',
  futureWage: '0',
  futureFederalWithhold: '0',
  futureStateWithhold: '0',
  incomeMode: 'simple',
  paycheckWage: '0',
  paycheckFederal: '0',
  paycheckState: '0',
  payFrequency: 'biweekly',
  nextPayDate: '',
  lastPayDate: '',
  rsuVestWage: '0',
  rsuVestFederal: '0',
  rsuVestState: '0',
  vestPrice: '0',
  futureRSUVests: []
} as unknown as IncomeData

const baseDeductions: DeductionsData = {
  businessExpenses: '0',
  propertyTax: '0',
  mortgageInterest: '0',
  donations: '0',
  mortgageLoanDate: '',
  mortgageBalance: '0',
  otherStateIncomeTax: '0'
} as unknown as DeductionsData

const basePayments: EstimatedPaymentsData = {
  federalQ1: '0',
  federalQ2: '0',
  federalQ3: '0',
  federalQ4: '0',
  californiaQ1: '0',
  californiaQ2: '0',
  californiaQ4: '0'
} as unknown as EstimatedPaymentsData

describe('Capital gain netting (Schedule D)', () => {
  it('nets a short-term loss against a long-term gain', () => {
    expect(netCapitalGains(-20000, 50000)).toEqual({ shortTermGain: 0, longTermGain: 30000, lossDeduction: 0, disallowedLoss: 0 })
  })

  it('nets a long-term loss against a short-term gain', () => {
    expect(netCapitalGains(40000, -10000)).toEqual({ shortTermGain: 30000, longTermGain: 0, lossDeduction: 0, disallowedLoss: 0 })
  })

  it('limits a net loss to $3,000', () => {
    expect(netCapitalGains(-5000, -2000)).toEqual({ shortTermGain: 0, longTermGain: 0, lossDeduction: -3000, disallowedLoss: -4000 })
  })

  it('taxes -$20k ST / +$50k LT the same as $0 ST / +$30k LT', () => {
    const run = (st: string, lt: string) => calculateComprehensiveTax(
      2026, 'single', false, baseDeductions,
      { ...baseIncome, ytdWage: '100000', shortTermGains: st, longTermGains: lt },
      baseIncome, basePayments
    )!
    const netted = run('-20000', '50000')
    const plain = run('0', '30000')
    expect(netted.totalIncome).toBe(130000)
    expect(netted.federalTax.taxableIncome).toBe(130000 - 16100)
    expect(netted.federalTax.taxableIncome).toBe(plain.federalTax.taxableIncome)
    expect(netted.federalTax.capitalGainsTax).toBe(plain.federalTax.capitalGainsTax)
    expect(netted.federalTax.totalTax).toBe(plain.federalTax.totalTax)
  })

  it('taxes the net of a ST gain and LT loss as ordinary income', () => {
    const result = calculateComprehensiveTax(
      2026, 'single', false, baseDeductions,
      { ...baseIncome, ytdWage: '100000', shortTermGains: '40000', longTermGains: '-10000' },
      baseIncome, basePayments
    )!
    expect(result.federalTax.taxableIncome).toBe(130000 - 16100)
    expect(result.federalTax.capitalGainsTax).toBe(0)
  })
})

describe('Net Investment Income Tax (3.8%)', () => {
  it('taxes the lesser of NII or MAGI over the threshold', () => {
    expect(calculateNetInvestmentIncomeTax(100000, 300000, 'single')).toBeCloseTo(3800, 6)
    expect(calculateNetInvestmentIncomeTax(50000, 260000, 'marriedFilingJointly')).toBeCloseTo(380, 6)
    expect(calculateNetInvestmentIncomeTax(50000, 200000, 'single')).toBe(0)
    expect(calculateNetInvestmentIncomeTax(50000, 250000, 'marriedFilingJointly')).toBe(0)
  })

  it('is included in federal tax liability', () => {
    const result = calculateComprehensiveTax(
      2026, 'single', false, baseDeductions,
      { ...baseIncome, ytdWage: '250000', interestIncome: '100000' },
      baseIncome, basePayments
    )!
    expect(result.netInvestmentIncome).toBe(100000)
    expect(result.federalTax.netInvestmentIncomeTax).toBe(3800)
    // $250k wages also trigger 0.9% Additional Medicare Tax on $50k
    expect(result.federalTax.additionalMedicareTax).toBe(450)
    expect(result.federalTax.totalTax).toBe(
      result.federalTax.ordinaryIncomeTax + result.federalTax.capitalGainsTax + 3800 + 450
    )
  })

  it('excludes wages and Roth conversions from NII but counts them in MAGI', () => {
    const result = calculateComprehensiveTax(
      2026, 'single', false, baseDeductions,
      { ...baseIncome, ytdWage: '150000', rothConversion: '100000', longTermGains: '20000' },
      baseIncome, basePayments
    )!
    expect(result.netInvestmentIncome).toBe(20000)
    // MAGI $270k exceeds $200k by $70k; NII $20k is smaller
    expect(result.federalTax.netInvestmentIncomeTax).toBe(760)
  })
})

describe('Additional Medicare Tax (0.9%)', () => {
  it('single filer: employer withholding covers the tax', () => {
    const r = calculateAdditionalMedicareTax([300000], 'single')
    expect(r.tax).toBeCloseTo(900, 6)
    expect(r.withheld).toBeCloseTo(900, 6)
  })

  it('MFJ two earners under $200k each: tax owed with no withholding', () => {
    const r = calculateAdditionalMedicareTax([150000, 150000], 'marriedFilingJointly')
    expect(r.tax).toBeCloseTo(450, 6)
    expect(r.withheld).toBe(0)
  })

  it('MFJ one earner over $200k: employer over-withholds relative to the joint threshold', () => {
    const r = calculateAdditionalMedicareTax([300000, 0], 'marriedFilingJointly')
    expect(r.tax).toBeCloseTo(450, 6)
    expect(r.withheld).toBeCloseTo(900, 6)
  })

  it('is added to tax and its withholding credited in the full calculation', () => {
    const result = calculateComprehensiveTax(
      2026, 'marriedFilingJointly', false, baseDeductions,
      { ...baseIncome, ytdWage: '150000', ytdFederalWithhold: '20000' },
      { ...baseIncome, ytdWage: '150000', ytdFederalWithhold: '20000' },
      basePayments
    )!
    expect(result.federalTax.additionalMedicareTax).toBe(450)
    expect(result.federalTax.additionalMedicareWithheld).toBe(0)
    expect(result.federalTax.withholdings).toBe(40000)
    expect(result.federalTax.totalTax).toBe(result.federalTax.ordinaryIncomeTax + 450)
  })
})

describe('OBBBA deduction rules (2026+)', () => {
  const deductions = { ...baseDeductions, donations: '10000' }

  it('applies a 0.5% of AGI floor to itemized donations from 2026, not in 2025', () => {
    const d2025 = calculateFederalItemizedDeductionDetails(deductions, 0, false, 2025, 200000, 'single', 200000)
    const d2026 = calculateFederalItemizedDeductionDetails(deductions, 0, false, 2026, 200000, 'single', 200000)
    const d2027 = calculateFederalItemizedDeductionDetails(deductions, 0, false, 2027, 200000, 'single', 200000)
    expect(d2025.charitableFloor).toBe(0)
    expect(d2025.total).toBe(10000)
    expect(d2026.charitableFloor).toBe(1000)
    expect(d2026.deductibleDonations).toBe(9000)
    expect(d2026.total).toBe(9000)
    expect(d2027.total).toBe(9000)
  })

  it('limits itemized deductions by 2/37 for 37%-bracket income', () => {
    // MFJ 2026 37% bracket starts at $768,700
    expect(calculateFederalItemizedLimitation(50000, 900000, 'marriedFilingJointly', 2026)).toBeCloseTo(50000 * 2 / 37, 6)
    expect(calculateFederalItemizedLimitation(50000, 788700, 'marriedFilingJointly', 2026)).toBeCloseTo(20000 * 2 / 37, 6)
    expect(calculateFederalItemizedLimitation(50000, 700000, 'marriedFilingJointly', 2026)).toBe(0)
    // MFJ 2027 37% bracket starts at $793,650
    expect(calculateFederalItemizedLimitation(50000, 813650, 'marriedFilingJointly', 2027)).toBeCloseTo(20000 * 2 / 37, 6)
    expect(calculateFederalItemizedLimitation(50000, 900000, 'marriedFilingJointly', 2025)).toBe(0)
  })

  it('allows a capped charitable deduction for non-itemizers from 2026', () => {
    expect(calculateNonItemizerCharitableDeduction(500, 'single', 2026)).toBe(500)
    expect(calculateNonItemizerCharitableDeduction(5000, 'single', 2026)).toBe(1000)
    expect(calculateNonItemizerCharitableDeduction(5000, 'marriedFilingJointly', 2027)).toBe(2000)
    expect(calculateNonItemizerCharitableDeduction(5000, 'single', 2025)).toBe(0)
  })

  it('adds the non-itemizer charitable deduction on top of the standard deduction', () => {
    const run = (year: 2025 | 2026) => calculateComprehensiveTax(
      year, 'single', false, { ...baseDeductions, donations: '500' },
      { ...baseIncome, ytdWage: '80000' }, baseIncome, basePayments
    )!
    expect(run(2026).federalTax.taxableIncome).toBe(80000 - 16100 - 500)
    expect(run(2026).deductions.federal.nonItemizerCharitable).toBe(500)
    expect(run(2025).federalTax.taxableIncome).toBe(80000 - 15000)
  })

  it('applies the 2/37 limitation in the full calculation', () => {
    const result = calculateComprehensiveTax(
      2026, 'marriedFilingJointly', false,
      { ...baseDeductions, propertyTax: '10000', mortgageInterest: '40000', mortgageBalance: '700000', mortgageLoanDate: 'after-dec-15-2017', donations: '20000' } as DeductionsData,
      { ...baseIncome, ytdWage: '1000000' }, baseIncome, basePayments
    )!
    const itemized = result.deductions.federal.itemized
    // SALT $10k (cap at $1M MAGI floors at $10k) + mortgage $40k + donations $20k - 0.5% x $1M floor
    expect(itemized.totalBeforeLimitation).toBe(10000 + 40000 + 15000)
    expect(itemized.limitationReduction).toBeCloseTo(65000 * 2 / 37, 6)
    expect(result.deductions.federal.useItemized).toBe(true)
  })
})

describe('California exemption credit and itemized limitation', () => {
  it('gives the full personal exemption credit at or below the AGI threshold', () => {
    expect(calculateCaliforniaExemptionCredit(100000, 'single', 2026)).toBe(158)
    expect(calculateCaliforniaExemptionCredit(260778, 'single', 2026)).toBe(158)
    expect(calculateCaliforniaExemptionCredit(100000, 'marriedFilingJointly', 2026)).toBe(316)
    expect(calculateCaliforniaExemptionCredit(100000, 'single', 2025)).toBe(153)
  })

  it('reduces the credit $6 per credit for each $2,500 (or fraction) over the threshold', () => {
    expect(calculateCaliforniaExemptionCredit(260779, 'single', 2026)).toBe(152)
    expect(calculateCaliforniaExemptionCredit(260778 + 2500, 'single', 2026)).toBe(152)
    expect(calculateCaliforniaExemptionCredit(260778 + 2501, 'single', 2026)).toBe(146)
    expect(calculateCaliforniaExemptionCredit(521562, 'marriedFilingJointly', 2026)).toBe(304)
    expect(calculateCaliforniaExemptionCredit(1000000, 'single', 2026)).toBe(0)
  })

  it('limits itemized deductions by the lesser of 6% of excess AGI or 80% of itemized', () => {
    expect(calculateCaliforniaItemizedLimitation(50000, 621561, 'marriedFilingJointly', 2026)).toBeCloseTo(6000, 6)
    expect(calculateCaliforniaItemizedLimitation(5000, 621561, 'marriedFilingJointly', 2026)).toBeCloseTo(4000, 6)
    expect(calculateCaliforniaItemizedLimitation(50000, 500000, 'marriedFilingJointly', 2026)).toBe(0)
  })

  it('applies both in the full calculation', () => {
    const result = calculateComprehensiveTax(
      2026, 'marriedFilingJointly', true,
      { ...baseDeductions, propertyTax: '30000', mortgageInterest: '20000', mortgageBalance: '500000', mortgageLoanDate: 'after-dec-15-2017' } as DeductionsData,
      { ...baseIncome, ytdWage: '621561' }, baseIncome, basePayments
    )!
    const ca = result.californiaTax!
    expect(result.deductions.california!.itemized.limitationReduction).toBeCloseTo(6000, 6)
    expect(ca.deduction.amount).toBeCloseTo(44000, 6)
    // $100,000 over threshold = 40 steps x $12 = $480 reduction > $316 credit
    expect(ca.exemptionCredit).toBe(0)
  })
})

describe('Federal SALT uses California tax paid during the year', () => {
  it('counts withholdings plus Q1/Q2 estimated payments, not Q4', () => {
    expect(calculateCaliforniaTaxPaidInYear(15000, { ...basePayments, californiaQ1: '1000', californiaQ2: '2000', californiaQ4: '5000' })).toBe(18000)
  })

  it('feeds the federal itemized SALT deduction', () => {
    const result = calculateComprehensiveTax(
      2026, 'single', true,
      { ...baseDeductions, propertyTax: '10000' },
      { ...baseIncome, ytdWage: '200000', ytdStateWithhold: '15000' },
      baseIncome,
      { ...basePayments, californiaQ1: '1000', californiaQ2: '2000', californiaQ4: '5000' }
    )!
    expect(result.deductions.federal.itemized.stateIncomeTax).toBe(18000)
    expect(result.deductions.federal.itemized.saltDeduction).toBe(28000)
  })
})

describe('Future paychecks are limited to the selected tax year', () => {
  const detailed = {
    ...baseIncome,
    incomeMode: 'detailed',
    paycheckWage: '5000',
    paycheckFederal: '1000',
    paycheckState: '400',
    payFrequency: 'biweekly',
    nextPayDate: '2026-12-11'
  } as unknown as IncomeData

  it('counts only pay dates inside the tax year', () => {
    expect(calculateFutureIncome(detailed, 2026).totalWage).toBe(2 * 5000)   // Dec 11, Dec 25
    expect(calculateFutureIncome(detailed, 2027).totalWage).toBe(26 * 5000)  // Jan 8 ... Dec 24, 2027
    expect(calculateFutureIncome(detailed, 2025).totalWage).toBe(0)
  })

  it('counts only RSU vests dated inside the tax year', () => {
    const withVests = {
      ...baseIncome,
      rsuVestWage: '10000',
      rsuVestFederal: '2200',
      rsuVestState: '1000',
      futureRSUVests: [
        { id: '1', date: '2026-12-15', shares: '10', expectedPrice: '100' },
        { id: '2', date: '2027-03-15', shares: '20', expectedPrice: '100' },
        { id: '3', date: '', shares: '1', expectedPrice: '100' }
      ]
    } as unknown as IncomeData
    expect(calculateFutureIncome({ ...withVests, incomeMode: 'detailed' } as IncomeData, 2026).totalWage).toBe(1000 + 100)
    expect(calculateFutureIncome({ ...withVests, incomeMode: 'detailed' } as IncomeData, 2027).totalWage).toBe(2000 + 100)
  })

  it('counts monthly pay dates and remaining paychecks by tax year', () => {
    expect(calculateRemainingPaychecks('2026-12-11', 'biweekly', undefined, 2026)).toBe(2)
    expect(calculateRemainingPaychecks('2026-11-15', 'monthly', undefined, 2026)).toBe(2)
    expect(calculateRemainingPaychecks('2026-11-15', 'monthly', undefined, 2027)).toBe(12)
  })
})

describe('Estimated payment due dates use the local calendar day', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const schedule = [
    { quarter: 'Q1', dueDate: 'April 15, 2026', dueDateObj: new Date('2026-04-15'), cumulativePercentage: 0.25, paid: 0 },
    { quarter: 'Q2', dueDate: 'June 15, 2026', dueDateObj: new Date('2026-06-15'), cumulativePercentage: 0.5, paid: 0 }
  ]

  it('is not past due during the due date itself', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 15, 18, 0, 0))
    const result = calculateEstimatedPaymentsWithCumulativeSchedule(1000, schedule)
    expect(result[0].isPastDue).toBe(false)
    expect(result[0].amount).toBe(250)
  })

  it('is past due the day after', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 16, 0, 0, 1))
    const result = calculateEstimatedPaymentsWithCumulativeSchedule(1000, schedule)
    expect(result[0].isPastDue).toBe(true)
  })
})

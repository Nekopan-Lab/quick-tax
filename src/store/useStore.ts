import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FutureRSUVest {
  id: string
  date: string
  shares: string
  expectedPrice: string
}

interface IncomeData {
  // Investment Income
  ordinaryDividends: string
  qualifiedDividends: string
  interestIncome: string
  shortTermGains: string
  longTermGains: string
  
  // YTD W2
  ytdWage: string
  ytdFederalWithhold: string
  ytdStateWithhold: string
  
  // Future Income - Simple Mode
  futureWage: string
  futureFederalWithhold: string
  futureStateWithhold: string
  
  // Future Income - Detailed Mode
  incomeMode: 'simple' | 'detailed'
  paycheckWage: string
  paycheckFederal: string
  paycheckState: string
  payFrequency: 'biweekly' | 'monthly'
  nextPayDate: string
  
  // RSU Data
  rsuVestWage: string
  rsuVestFederal: string
  rsuVestState: string
  vestPrice: string
  futureRSUVests: FutureRSUVest[]
}

interface DeductionsData {
  propertyTax: string
  mortgageInterest: string
  donations: string
}

interface EstimatedPaymentsData {
  // Federal estimated payments by quarter
  federalQ1: string
  federalQ2: string
  federalQ3: string
  federalQ4: string
  // California estimated payments by quarter (Q3 is 0)
  californiaQ1: string
  californiaQ2: string
  californiaQ4: string
}

interface TaxStore {
  // Tax Year
  taxYear: number
  setTaxYear: (year: number) => void
  
  // Filing Status
  filingStatus: 'single' | 'marriedFilingJointly' | null
  setFilingStatus: (status: 'single' | 'marriedFilingJointly') => void
  
  // Tax Scope
  includeCaliforniaTax: boolean
  setIncludeCaliforniaTax: (include: boolean) => void
  
  // Deductions
  deductions: DeductionsData
  setDeductions: (deductions: Partial<DeductionsData>) => void
  
  // Income Data
  userIncome: IncomeData
  spouseIncome: IncomeData
  setUserIncome: (income: Partial<IncomeData>) => void
  setSpouseIncome: (income: Partial<IncomeData>) => void
  
  // Estimated Payments
  estimatedPayments: EstimatedPaymentsData
  setEstimatedPayments: (payments: Partial<EstimatedPaymentsData>) => void
  
  // Clear all data
  clearAllData: () => void
}

const initialIncomeData: IncomeData = {
  // Investment Income
  ordinaryDividends: '',
  qualifiedDividends: '',
  interestIncome: '',
  shortTermGains: '',
  longTermGains: '',
  
  // YTD W2
  ytdWage: '',
  ytdFederalWithhold: '',
  ytdStateWithhold: '',
  
  // Future Income - Simple Mode
  futureWage: '',
  futureFederalWithhold: '',
  futureStateWithhold: '',
  
  // Future Income - Detailed Mode
  incomeMode: 'detailed',
  paycheckWage: '',
  paycheckFederal: '',
  paycheckState: '',
  payFrequency: 'biweekly',
  nextPayDate: '',
  
  // RSU Data
  rsuVestWage: '',
  rsuVestFederal: '',
  rsuVestState: '',
  vestPrice: '',
  futureRSUVests: [],
}

const initialDeductionsData: DeductionsData = {
  propertyTax: '',
  mortgageInterest: '',
  donations: '',
}

const initialEstimatedPaymentsData: EstimatedPaymentsData = {
  federalQ1: '',
  federalQ2: '',
  federalQ3: '',
  federalQ4: '',
  californiaQ1: '',
  californiaQ2: '',
  californiaQ4: '',
}

export const useStore = create<TaxStore>()(
  persist(
    (set) => ({
      // Initial state
      taxYear: 2025,
      filingStatus: null,
      includeCaliforniaTax: true,
      deductions: { ...initialDeductionsData },
      userIncome: { ...initialIncomeData },
      spouseIncome: { ...initialIncomeData },
      estimatedPayments: { ...initialEstimatedPaymentsData },
      
      // Actions
      setTaxYear: (year) => set({ taxYear: year }),
      setFilingStatus: (status) => set({ filingStatus: status }),
      setIncludeCaliforniaTax: (include) => set({ includeCaliforniaTax: include }),
      
      setDeductions: (deductions) => set((state) => ({
        deductions: { ...state.deductions, ...deductions }
      })),
      
      setUserIncome: (income) => set((state) => ({
        userIncome: { ...state.userIncome, ...income }
      })),
      
      setSpouseIncome: (income) => set((state) => ({
        spouseIncome: { ...state.spouseIncome, ...income }
      })),
      
      setEstimatedPayments: (payments) => set((state) => ({
        estimatedPayments: { ...state.estimatedPayments, ...payments }
      })),
      
      clearAllData: () => set({
        taxYear: 2025,
        filingStatus: null,
        includeCaliforniaTax: true,
        deductions: { ...initialDeductionsData },
        userIncome: { ...initialIncomeData },
        spouseIncome: { ...initialIncomeData },
        estimatedPayments: { ...initialEstimatedPaymentsData },
      }),
    }),
    {
      name: 'quick-tax-storage',
    }
  )
)
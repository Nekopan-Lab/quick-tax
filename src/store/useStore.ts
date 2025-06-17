import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FutureRSUVest {
  id: string
  date: string
  shares: string
  expectedPrice: string
}

export interface IncomeData {
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

export interface DeductionsData {
  propertyTax: string
  mortgageInterest: string
  donations: string
  
  // New mortgage-related fields
  mortgageLoanDate: 'before-dec-16-2017' | 'after-dec-15-2017' | ''
  mortgageBalance: string
  
  // State tax field (for users not using CA tax)
  otherStateIncomeTax: string
  
  // Business expense fields (Schedule C)
  businessExpenses: string
}

export interface EstimatedPaymentsData {
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
  // Current Step
  currentStep: number
  setCurrentStep: (step: number) => void
  
  // Tax Year
  taxYear: number
  setTaxYear: (year: number) => void
  
  // Filing Status
  filingStatus: 'single' | 'marriedFilingJointly'
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
  mortgageLoanDate: '',
  mortgageBalance: '',
  otherStateIncomeTax: '',
  businessExpenses: '',
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
      currentStep: 1,
      taxYear: 2025,
      filingStatus: 'marriedFilingJointly',
      includeCaliforniaTax: true,
      deductions: { ...initialDeductionsData },
      userIncome: { ...initialIncomeData },
      spouseIncome: { ...initialIncomeData },
      estimatedPayments: { ...initialEstimatedPaymentsData },
      
      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),
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
        currentStep: 1,
        taxYear: 2025,
        filingStatus: 'marriedFilingJointly',
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
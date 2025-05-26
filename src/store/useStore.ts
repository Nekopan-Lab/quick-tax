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

interface TaxStore {
  // Filing Status
  filingStatus: 'single' | 'marriedFilingJointly' | null
  setFilingStatus: (status: 'single' | 'marriedFilingJointly') => void
  
  // Tax Scope
  includeCaliforniaTax: boolean
  setIncludeCaliforniaTax: (include: boolean) => void
  
  // Income Data
  userIncome: IncomeData
  spouseIncome: IncomeData
  setUserIncome: (income: Partial<IncomeData>) => void
  setSpouseIncome: (income: Partial<IncomeData>) => void
  
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

export const useStore = create<TaxStore>()(
  persist(
    (set) => ({
      // Initial state
      filingStatus: null,
      includeCaliforniaTax: true,
      userIncome: { ...initialIncomeData },
      spouseIncome: { ...initialIncomeData },
      
      // Actions
      setFilingStatus: (status) => set({ filingStatus: status }),
      setIncludeCaliforniaTax: (include) => set({ includeCaliforniaTax: include }),
      
      setUserIncome: (income) => set((state) => ({
        userIncome: { ...state.userIncome, ...income }
      })),
      
      setSpouseIncome: (income) => set((state) => ({
        spouseIncome: { ...state.spouseIncome, ...income }
      })),
      
      clearAllData: () => set({
        filingStatus: null,
        includeCaliforniaTax: true,
        userIncome: { ...initialIncomeData },
        spouseIncome: { ...initialIncomeData },
      }),
    }),
    {
      name: 'quick-tax-storage',
    }
  )
)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TaxStore {
  // Filing Status
  filingStatus: 'single' | 'marriedFilingJointly' | null
  setFilingStatus: (status: 'single' | 'marriedFilingJointly') => void
  
  // Tax Scope
  includeCaliforniaTax: boolean
  setIncludeCaliforniaTax: (include: boolean) => void
  
  // Clear all data
  clearAllData: () => void
}

export const useStore = create<TaxStore>()(
  persist(
    (set) => ({
      // Initial state
      filingStatus: null,
      includeCaliforniaTax: true,
      
      // Actions
      setFilingStatus: (status) => set({ filingStatus: status }),
      setIncludeCaliforniaTax: (include) => set({ includeCaliforniaTax: include }),
      
      clearAllData: () => set({
        filingStatus: null,
        includeCaliforniaTax: true,
      }),
    }),
    {
      name: 'quick-tax-storage',
    }
  )
)
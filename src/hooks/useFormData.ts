import { useState, useEffect, useCallback } from 'react';
import { TaxFormData, PersonIncome } from '../types';

const STORAGE_KEY = 'quicktax-form-data';

const defaultPersonIncome: PersonIncome = {
  ordinaryDividends: 0,
  qualifiedDividends: 0,
  interestIncome: 0,
  shortTermCapitalGains: 0,
  longTermCapitalGains: 0,
  ytdTaxableWage: 0,
  ytdFederalWithhold: 0,
  ytdStateWithhold: 0,
  futureIncomeMode: 'detailed',
  estimatedFutureTaxableWage: 0,
  estimatedFutureFederalWithhold: 0,
  estimatedFutureStateWithhold: 0,
  paycheckData: {
    taxableWagePerPaycheck: 0,
    federalWithholdPerPaycheck: 0,
    stateWithholdPerPaycheck: 0,
    paymentFrequency: 'biweekly',
    nextPaymentDate: new Date().toISOString().split('T')[0],
  },
  rsuVestData: {
    taxableWagePerVest: 0,
    federalWithholdPerVest: 0,
    stateWithholdPerVest: 0,
    vestPrice: 0,
  },
  futureRSUVests: {
    numberOfVests: 0,
    expectedVestPrice: 0,
  },
};

const defaultFormData: TaxFormData = {
  filingStatus: 'single',
  includeCaliforniaTax: true,
  propertyTax: 0,
  mortgageInterest: 0,
  donations: 0,
  userIncome: { ...defaultPersonIncome },
  spouseIncome: undefined,
  federalEstimatedPayments: {
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
  },
  californiaEstimatedPayments: {
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
  },
};

export function useFormData() {
  const [formData, setFormData] = useState<TaxFormData>(() => {
    // Load from localStorage on initialization
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
    return defaultFormData;
  });

  // Save to localStorage whenever formData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [formData]);

  // Update functions
  const updateFilingStatus = useCallback((filingStatus: TaxFormData['filingStatus']) => {
    setFormData(prev => {
      const updated = { ...prev, filingStatus };
      
      // Add spouse income if married filing jointly
      if (filingStatus === 'marriedFilingJointly' && !updated.spouseIncome) {
        updated.spouseIncome = { ...defaultPersonIncome };
      }
      // Remove spouse income if single
      else if (filingStatus === 'single') {
        updated.spouseIncome = undefined;
      }
      
      return updated;
    });
  }, []);

  const updateCaliforniaTaxScope = useCallback((include: boolean) => {
    setFormData(prev => ({
      ...prev,
      includeCaliforniaTax: include,
      // Reset California payments if not including
      californiaEstimatedPayments: include ? prev.californiaEstimatedPayments : {
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
      },
    }));
  }, []);

  const updateDeductions = useCallback((deductions: Partial<{
    propertyTax: number;
    mortgageInterest: number;
    donations: number;
  }>) => {
    setFormData(prev => ({
      ...prev,
      ...deductions,
    }));
  }, []);

  const updateUserIncome = useCallback((income: Partial<PersonIncome>) => {
    setFormData(prev => ({
      ...prev,
      userIncome: {
        ...prev.userIncome,
        ...income,
      },
    }));
  }, []);

  const updateSpouseIncome = useCallback((income: Partial<PersonIncome>) => {
    setFormData(prev => ({
      ...prev,
      spouseIncome: prev.spouseIncome ? {
        ...prev.spouseIncome,
        ...income,
      } : undefined,
    }));
  }, []);

  const updateFederalEstimatedPayments = useCallback((payments: Partial<TaxFormData['federalEstimatedPayments']>) => {
    setFormData(prev => ({
      ...prev,
      federalEstimatedPayments: {
        ...prev.federalEstimatedPayments,
        ...payments,
      },
    }));
  }, []);

  const updateCaliforniaEstimatedPayments = useCallback((payments: Partial<NonNullable<TaxFormData['californiaEstimatedPayments']>>) => {
    setFormData(prev => ({
      ...prev,
      californiaEstimatedPayments: prev.californiaEstimatedPayments ? {
        ...prev.californiaEstimatedPayments,
        ...payments,
      } : undefined,
    }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(defaultFormData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    formData,
    updateFilingStatus,
    updateCaliforniaTaxScope,
    updateDeductions,
    updateUserIncome,
    updateSpouseIncome,
    updateFederalEstimatedPayments,
    updateCaliforniaEstimatedPayments,
    resetFormData,
  };
}
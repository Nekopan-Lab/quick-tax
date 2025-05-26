import React from 'react';
import { TaxFormData } from '../types';
import { FEDERAL_TAX_RATES_2025, CALIFORNIA_TAX_RATES_2025 } from '../constants/taxRates';
import { ValidatedInput } from './ValidatedInput';
import { useValidatedInput } from '../hooks/useValidatedInput';
import { validatePositiveNumber } from '../utils/validation';

interface Step2DeductionsProps {
  formData: TaxFormData;
  updateDeductions: (deductions: Partial<{
    propertyTax: number;
    mortgageInterest: number;
    donations: number;
  }>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step2Deductions({
  formData,
  updateDeductions,
  onNext,
  onPrevious,
}: Step2DeductionsProps) {
  const federalStandardDeduction = FEDERAL_TAX_RATES_2025.standardDeductions[formData.filingStatus];
  const californiaStandardDeduction = CALIFORNIA_TAX_RATES_2025.standardDeductions[formData.filingStatus];
  
  const propertyTaxInput = useValidatedInput(
    formData.propertyTax,
    (value: number) => validatePositiveNumber(value, 'Property Tax')
  );
  
  const mortgageInterestInput = useValidatedInput(
    formData.mortgageInterest,
    (value: number) => validatePositiveNumber(value, 'Mortgage Interest')
  );
  
  const donationsInput = useValidatedInput(
    formData.donations,
    (value: number) => validatePositiveNumber(value, 'Donations')
  );
  
  const totalItemized = formData.propertyTax + formData.mortgageInterest + formData.donations;
  
  const federalDeductionType = totalItemized > federalStandardDeduction ? 'itemized' : 'standard';
  const californiaDeductionType = totalItemized > californiaStandardDeduction ? 'itemized' : 'standard';

  const handleInputChange = (
    field: 'propertyTax' | 'mortgageInterest' | 'donations',
    value: string,
    input: any
  ) => {
    const numValue = parseFloat(value) || 0;
    input.setValue(numValue);
    if (input.isValid || numValue === 0) {
      updateDeductions({ [field]: numValue });
    }
  };
  
  const allInputsValid = propertyTaxInput.isValid && mortgageInterestInput.isValid && donationsInput.isValid;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 2: Deductions</h2>
        <p className="text-gray-600">Enter your estimated full-year deductions</p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-700">
            We'll automatically determine whether standard or itemized deduction is better for you based on your entries.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <ValidatedInput
          label="Estimated Full-Year Property Tax"
          type="number"
          value={propertyTaxInput.value}
          onChange={(value) => handleInputChange('propertyTax', value, propertyTaxInput)}
          onBlur={propertyTaxInput.onBlur}
          error={propertyTaxInput.error}
          placeholder="0"
          min="0"
        />

        <ValidatedInput
          label="Estimated Full-Year Mortgage Interest"
          type="number"
          value={mortgageInterestInput.value}
          onChange={(value) => handleInputChange('mortgageInterest', value, mortgageInterestInput)}
          onBlur={mortgageInterestInput.onBlur}
          error={mortgageInterestInput.error}
          placeholder="0"
          min="0"
        />

        <ValidatedInput
          label="Estimated Full-Year Donations"
          type="number"
          value={donationsInput.value}
          onChange={(value) => handleInputChange('donations', value, donationsInput)}
          onBlur={donationsInput.onBlur}
          error={donationsInput.error}
          placeholder="0"
          min="0"
        />
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Federal Deduction Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Standard Deduction</span>
              <span className="text-gray-900 font-semibold">${federalStandardDeduction.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Itemized</span>
              <span className="text-gray-900 font-semibold">${totalItemized.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-gray-700 font-medium">Recommendation</span>
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-600 font-semibold">
                  {federalDeductionType === 'itemized' ? 'Itemized' : 'Standard'} (${Math.max(federalStandardDeduction, totalItemized).toLocaleString()})
                </span>
              </div>
            </div>
          </div>
        </div>

        {formData.includeCaliforniaTax && (
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">California Deduction Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Standard Deduction</span>
                <span className="text-gray-900 font-semibold">${californiaStandardDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Itemized</span>
                <span className="text-gray-900 font-semibold">${totalItemized.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-700 font-medium">Recommendation</span>
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-600 font-semibold">
                    {californiaDeductionType === 'itemized' ? 'Itemized' : 'Standard'} (${Math.max(californiaStandardDeduction, totalItemized).toLocaleString()})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md font-medium"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={!allInputsValid}
          className={`px-6 py-3 text-white rounded-lg transition-all shadow-sm font-medium ${
            allInputsValid 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
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
    input: ReturnType<typeof useValidatedInput>
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
      <h2 className="text-2xl font-bold text-gray-100">Step 2: Deductions</h2>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-400">
          Enter your estimated full-year deductions. We'll automatically determine whether standard or itemized deduction is better for you.
        </p>
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
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Federal Deduction Analysis</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              Standard Deduction: <span className="text-gray-100 font-medium">${federalStandardDeduction.toLocaleString()}</span>
            </p>
            <p className="text-gray-300">
              Total Itemized: <span className="text-gray-100 font-medium">${totalItemized.toLocaleString()}</span>
            </p>
            <p className="text-green-400 font-medium">
              Using {federalDeductionType} deduction (${Math.max(federalStandardDeduction, totalItemized).toLocaleString()})
            </p>
          </div>
        </div>

        {formData.includeCaliforniaTax && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">California Deduction Analysis</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                Standard Deduction: <span className="text-gray-100 font-medium">${californiaStandardDeduction.toLocaleString()}</span>
              </p>
              <p className="text-gray-300">
                Total Itemized: <span className="text-gray-100 font-medium">${totalItemized.toLocaleString()}</span>
              </p>
              <p className="text-green-400 font-medium">
                Using {californiaDeductionType} deduction (${Math.max(californiaStandardDeduction, totalItemized).toLocaleString()})
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!allInputsValid}
          className={`px-6 py-2 text-white rounded-lg transition-colors ${
            allInputsValid 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
import React from 'react';
import { TaxFormData } from '../types';

interface Step1FilingStatusProps {
  formData: TaxFormData;
  updateFilingStatus: (status: TaxFormData['filingStatus']) => void;
  updateCaliforniaTaxScope: (include: boolean) => void;
  onNext: () => void;
}

export function Step1FilingStatus({
  formData,
  updateFilingStatus,
  updateCaliforniaTaxScope,
  onNext,
}: Step1FilingStatusProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Step 1: Filing Status & Tax Scope</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Filing Status
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="filingStatus"
                value="single"
                checked={formData.filingStatus === 'single'}
                onChange={() => updateFilingStatus('single')}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span className="text-gray-100">Single</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="filingStatus"
                value="marriedFilingJointly"
                checked={formData.filingStatus === 'marriedFilingJointly'}
                onChange={() => updateFilingStatus('marriedFilingJointly')}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span className="text-gray-100">Married Filing Jointly</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tax Scope
          </label>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-3">
              Federal tax calculation is always included
            </p>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.includeCaliforniaTax}
                onChange={(e) => updateCaliforniaTaxScope(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-100">Include California State Tax (FTB)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
import React from 'react';
import { TaxFormData } from '../types';
import { ToggleGroup } from './ToggleGroup';
import { Switch } from './Switch';

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
  const filingStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'marriedFilingJointly', label: 'Married Filing Jointly' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Filing Status & Tax Scope</h2>
        <p className="text-gray-600">Let's start with your basic tax information</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Filing Status
          </label>
          <ToggleGroup
            options={filingStatusOptions}
            value={formData.filingStatus}
            onChange={(value) => updateFilingStatus(value as TaxFormData['filingStatus'])}
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Tax Calculations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-gray-700">Federal Tax (IRS)</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">Always Included</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Switch
                checked={formData.includeCaliforniaTax}
                onChange={updateCaliforniaTaxScope}
                label="California State Tax (FTB)"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
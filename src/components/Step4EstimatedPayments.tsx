import React from 'react';
import { TaxFormData, EstimatedPayments } from '../types';
import { FEDERAL_TAX_RATES_2025, CALIFORNIA_TAX_RATES_2025 } from '../constants/taxRates';

interface Step4EstimatedPaymentsProps {
  formData: TaxFormData;
  updateFederalEstimatedPayments: (payments: Partial<EstimatedPayments>) => void;
  updateCaliforniaEstimatedPayments: (payments: Partial<EstimatedPayments>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step4EstimatedPayments({
  formData,
  updateFederalEstimatedPayments,
  updateCaliforniaEstimatedPayments,
  onNext,
  onPrevious,
}: Step4EstimatedPaymentsProps) {
  const handleFederalChange = (quarter: keyof EstimatedPayments, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateFederalEstimatedPayments({ [quarter]: numValue });
  };

  const handleCaliforniaChange = (quarter: keyof EstimatedPayments, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateCaliforniaEstimatedPayments({ [quarter]: numValue });
  };

  const totalFederalPayments = 
    formData.federalEstimatedPayments.q1 +
    formData.federalEstimatedPayments.q2 +
    formData.federalEstimatedPayments.q3 +
    formData.federalEstimatedPayments.q4;

  const totalCaliforniaPayments = formData.californiaEstimatedPayments
    ? formData.californiaEstimatedPayments.q1 +
      formData.californiaEstimatedPayments.q2 +
      formData.californiaEstimatedPayments.q3 +
      formData.californiaEstimatedPayments.q4
    : 0;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 4: Estimated Tax Payments YTD</h2>
        <p className="text-gray-600">Enter any estimated tax payments you've already made for the 2025 tax year</p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-700">
            Include only payments already made. We'll calculate any additional payments needed in the summary.
          </p>
        </div>
      </div>

      {/* Federal Estimated Payments */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Federal Estimated Tax Payments</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEDERAL_TAX_RATES_2025.estimatedTaxDueDates.map((dueDate) => {
            const quarter = dueDate.quarter.toLowerCase() as keyof EstimatedPayments;
            return (
              <div key={quarter}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {dueDate.quarter} Payment
                  <span className="text-xs text-gray-500 block">Due: {new Date(dueDate.dueDate).toLocaleDateString()}</span>
                  <span className="text-xs text-gray-600 block">{dueDate.coverage}</span>
                </label>
                <input
                  type="number"
                  value={formData.federalEstimatedPayments[quarter] || ''}
                  onChange={(e) => handleFederalChange(quarter, e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            );
          })}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700">
            Total Federal Estimated Payments: <span className="text-blue-600 font-semibold">${totalFederalPayments.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* California Estimated Payments */}
      {formData.includeCaliforniaTax && (
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">California Estimated Tax Payments</h3>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-amber-800">
                California has a different payment schedule: 30% in Q1, 40% in Q2, 0% in Q3, and 30% in Q4.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CALIFORNIA_TAX_RATES_2025.estimatedTaxDueDates.map((dueDate) => {
              const quarter = dueDate.quarter.toLowerCase() as keyof EstimatedPayments;
              return (
                <div key={quarter}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {dueDate.quarter} Payment ({(dueDate.percentage * 100).toFixed(0)}%)
                    <span className="text-xs text-gray-500 block">Due: {new Date(dueDate.dueDate).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-600 block">{dueDate.coverage}</span>
                  </label>
                  <input
                    type="number"
                    value={formData.californiaEstimatedPayments?.[quarter] || ''}
                    onChange={(e) => handleCaliforniaChange(quarter, e.target.value)}
                    placeholder="0"
                    disabled={dueDate.percentage === 0}
                    className={`w-full px-3 py-2 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 ${
                      dueDate.percentage === 0 
                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    }`}
                  />
                </div>
              );
            })}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700">
              Total California Estimated Payments: <span className="text-blue-600 font-semibold">${totalCaliforniaPayments.toLocaleString()}</span>
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md font-medium"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
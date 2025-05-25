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
      <h2 className="text-2xl font-bold text-gray-100">Step 4: Estimated Tax Payments YTD</h2>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-400">
          Enter any estimated tax payments you've already made for the 2025 tax year.
        </p>
      </div>

      {/* Federal Estimated Payments */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-100">Federal Estimated Tax Payments</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEDERAL_TAX_RATES_2025.estimatedTaxDueDates.map((dueDate) => {
            const quarter = dueDate.quarter.toLowerCase() as keyof EstimatedPayments;
            return (
              <div key={quarter}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {dueDate.quarter} Payment
                  <span className="text-xs text-gray-400 block">Due: {new Date(dueDate.dueDate).toLocaleDateString()}</span>
                  <span className="text-xs text-gray-500 block">{dueDate.coverage}</span>
                </label>
                <input
                  type="number"
                  value={formData.federalEstimatedPayments[quarter] || ''}
                  onChange={(e) => handleFederalChange(quarter, e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            );
          })}
        </div>
        
        <div className="bg-gray-700/50 p-3 rounded-lg">
          <p className="text-sm text-gray-300">
            Total Federal Estimated Payments: <span className="text-gray-100 font-medium">${totalFederalPayments.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* California Estimated Payments */}
      {formData.includeCaliforniaTax && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-100">California Estimated Tax Payments</h3>
          
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-200">
              Note: California has a different payment schedule: 30% in Q1, 40% in Q2, 0% in Q3, and 30% in Q4.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CALIFORNIA_TAX_RATES_2025.estimatedTaxDueDates.map((dueDate) => {
              const quarter = dueDate.quarter.toLowerCase() as keyof EstimatedPayments;
              return (
                <div key={quarter}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {dueDate.quarter} Payment ({(dueDate.percentage * 100).toFixed(0)}%)
                    <span className="text-xs text-gray-400 block">Due: {new Date(dueDate.dueDate).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-500 block">{dueDate.coverage}</span>
                  </label>
                  <input
                    type="number"
                    value={formData.californiaEstimatedPayments?.[quarter] || ''}
                    onChange={(e) => handleCaliforniaChange(quarter, e.target.value)}
                    placeholder="0"
                    disabled={dueDate.percentage === 0}
                    className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      dueDate.percentage === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              );
            })}
          </div>
          
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-300">
              Total California Estimated Payments: <span className="text-gray-100 font-medium">${totalCaliforniaPayments.toLocaleString()}</span>
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Previous
        </button>
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
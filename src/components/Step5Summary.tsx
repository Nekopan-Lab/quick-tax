import React from 'react';
import { TaxCalculationResult } from '../types';

interface Step5SummaryProps {
  result: TaxCalculationResult | null;
  includeCaliforniaTax: boolean;
  onPrevious: () => void;
}

export function Step5Summary({ result, includeCaliforniaTax, onPrevious }: Step5SummaryProps) {
  if (!result) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 5: Summary & Actionable Insights</h2>
          <p className="text-gray-600">No tax calculation results available.</p>
        </div>
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md font-medium"
        >
          ← Previous
        </button>
      </div>
    );
  }

  const federalOwed = result.federal.taxOwedOrRefund;
  const californiaOwed = result.california?.taxOwedOrRefund || 0;
  const totalOwed = federalOwed + (includeCaliforniaTax ? californiaOwed : 0);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 5: Summary & Actionable Insights</h2>
        <p className="text-gray-600">Your complete tax analysis and recommendations</p>
      </div>

      {/* Total Tax Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-8 rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Tax Status Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Federal</p>
            <p className={`text-2xl font-bold ${federalOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {federalOwed > 0 ? 'Owe' : 'Refund'}
            </p>
            <p className="text-xl font-semibold text-gray-900">
              ${Math.abs(federalOwed).toLocaleString()}
            </p>
          </div>
          {includeCaliforniaTax && (
            <div className="text-center bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-2">California</p>
              <p className={`text-2xl font-bold ${californiaOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {californiaOwed > 0 ? 'Owe' : 'Refund'}
              </p>
              <p className="text-xl font-semibold text-gray-900">
                ${Math.abs(californiaOwed).toLocaleString()}
              </p>
            </div>
          )}
          <div className="text-center bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Total</p>
            <p className={`text-2xl font-bold ${totalOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalOwed > 0 ? 'Owe' : 'Refund'}
            </p>
            <p className="text-xl font-semibold text-gray-900">
              ${Math.abs(totalOwed).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Federal Tax Breakdown */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Federal Tax Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Income</span>
            <span className="text-gray-900 font-medium">${result.federal.totalIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Adjusted Gross Income (AGI)</span>
            <span className="text-gray-900 font-medium">${result.federal.adjustedGrossIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Deduction ({result.federal.deductionType})</span>
            <span className="text-gray-900 font-medium">-${result.federal.deductionAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-200 pt-3 mt-3">
            <span className="text-gray-600">Taxable Income</span>
            <span className="text-gray-900 font-medium">${result.federal.taxableIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ordinary Income Tax</span>
            <span className="text-gray-900 font-medium">${result.federal.ordinaryIncomeTax.toLocaleString()}</span>
          </div>
          {result.federal.capitalGainsTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Capital Gains Tax ({result.federal.capitalGainsRate}%)</span>
              <span className="text-gray-900 font-medium">${result.federal.capitalGainsTax.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t border-gray-200 pt-3 mt-3">
            <span className="text-gray-700 font-semibold">Total Tax Liability</span>
            <span className="text-gray-900 font-semibold">${result.federal.totalTaxLiability.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Withholdings</span>
            <span className="text-gray-900 font-medium">-${result.federal.totalWithholdings.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated Payments</span>
            <span className="text-gray-900 font-medium">-${result.federal.totalEstimatedPayments.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-3">
            <span className="text-gray-700 font-semibold">Tax Owed/Refund</span>
            <span className={`text-lg font-bold ${result.federal.taxOwedOrRefund > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${Math.abs(result.federal.taxOwedOrRefund).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Marginal Tax Rate</p>
              <p className="text-lg font-semibold text-gray-900">{result.federal.marginalTaxRate.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Effective Tax Rate</p>
              <p className="text-lg font-semibold text-gray-900">{result.federal.effectiveTaxRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* California Tax Breakdown */}
      {includeCaliforniaTax && result.california && (
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">California Tax Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Income</span>
              <span className="text-gray-900 font-medium">${result.california.totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Adjusted Gross Income (AGI)</span>
              <span className="text-gray-900 font-medium">${result.california.adjustedGrossIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Deduction ({result.california.deductionType})</span>
              <span className="text-gray-900 font-medium">-${result.california.deductionAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-3 mt-3">
              <span className="text-gray-600">Taxable Income</span>
              <span className="text-gray-900 font-medium">${result.california.taxableIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Tax Liability</span>
              <span className="text-gray-900 font-medium">${result.california.totalTaxLiability.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Withholdings</span>
              <span className="text-gray-900 font-medium">-${result.california.totalWithholdings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated Payments</span>
              <span className="text-gray-900 font-medium">-${result.california.totalEstimatedPayments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-3">
              <span className="text-gray-700 font-semibold">Tax Owed/Refund</span>
              <span className={`text-lg font-bold ${result.california.taxOwedOrRefund > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${Math.abs(result.california.taxOwedOrRefund).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Marginal Tax Rate</p>
                <p className="text-lg font-semibold text-gray-900">{result.california.marginalTaxRate.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Effective Tax Rate</p>
                <p className="text-lg font-semibold text-gray-900">{result.california.effectiveTaxRate.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Payments */}
      {(result.suggestedPayments.federal.length > 0 || 
        (includeCaliforniaTax && result.suggestedPayments.california && result.suggestedPayments.california.length > 0)) && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-3 mb-4">
            <svg className="h-6 w-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">Suggested Remaining Estimated Payments</h3>
          </div>
          
          {result.suggestedPayments.federal.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Federal</h4>
              <div className="bg-white rounded-lg p-4 space-y-3">
                {result.suggestedPayments.federal.map((payment) => (
                  <div key={payment.quarter} className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-900 font-medium">{payment.quarter}</span>
                      <span className="text-sm text-gray-600 ml-2">Due {new Date(payment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">${payment.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {includeCaliforniaTax && result.suggestedPayments.california && result.suggestedPayments.california.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-3">California</h4>
              <div className="bg-white rounded-lg p-4 space-y-3">
                {result.suggestedPayments.california.map((payment) => (
                  <div key={payment.quarter} className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-900 font-medium">{payment.quarter}</span>
                      <span className="text-sm text-gray-600 ml-2">Due {new Date(payment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">${payment.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-start">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md font-medium"
        >
          ← Previous
        </button>
      </div>
    </div>
  );
}
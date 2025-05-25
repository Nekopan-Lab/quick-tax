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
        <h2 className="text-2xl font-bold text-gray-100">Step 5: Summary & Actionable Insights</h2>
        <p className="text-gray-400">No tax calculation results available.</p>
        <button
          onClick={onPrevious}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Previous
        </button>
      </div>
    );
  }

  const federalOwed = result.federal.taxOwedOrRefund;
  const californiaOwed = result.california?.taxOwedOrRefund || 0;
  const totalOwed = federalOwed + (includeCaliforniaTax ? californiaOwed : 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Step 5: Summary & Actionable Insights</h2>

      {/* Total Tax Status */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Tax Status Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Federal</p>
            <p className={`text-2xl font-bold ${federalOwed > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {federalOwed > 0 ? 'Owe' : 'Refund'}: ${Math.abs(federalOwed).toLocaleString()}
            </p>
          </div>
          {includeCaliforniaTax && (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">California</p>
              <p className={`text-2xl font-bold ${californiaOwed > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {californiaOwed > 0 ? 'Owe' : 'Refund'}: ${Math.abs(californiaOwed).toLocaleString()}
              </p>
            </div>
          )}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Total</p>
            <p className={`text-2xl font-bold ${totalOwed > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {totalOwed > 0 ? 'Owe' : 'Refund'}: ${Math.abs(totalOwed).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Federal Tax Breakdown */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Federal Tax Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Income</span>
            <span className="text-gray-100">${result.federal.totalIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Adjusted Gross Income (AGI)</span>
            <span className="text-gray-100">${result.federal.adjustedGrossIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Deduction ({result.federal.deductionType})</span>
            <span className="text-gray-100">-${result.federal.deductionAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
            <span className="text-gray-400">Taxable Income</span>
            <span className="text-gray-100">${result.federal.taxableIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Ordinary Income Tax</span>
            <span className="text-gray-100">${result.federal.ordinaryIncomeTax.toLocaleString()}</span>
          </div>
          {result.federal.capitalGainsTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Capital Gains Tax ({result.federal.capitalGainsRate}%)</span>
              <span className="text-gray-100">${result.federal.capitalGainsTax.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
            <span className="text-gray-400 font-medium">Total Tax Liability</span>
            <span className="text-gray-100 font-medium">${result.federal.totalTaxLiability.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Withholdings</span>
            <span className="text-gray-100">-${result.federal.totalWithholdings.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Estimated Payments</span>
            <span className="text-gray-100">-${result.federal.totalEstimatedPayments.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
            <span className="text-gray-400 font-semibold">Tax Owed/Refund</span>
            <span className={`font-semibold ${result.federal.taxOwedOrRefund > 0 ? 'text-red-400' : 'text-green-400'}`}>
              ${Math.abs(result.federal.taxOwedOrRefund).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
            <div>
              <span className="text-gray-400">Marginal Tax Rate: </span>
              <span className="text-gray-100">{result.federal.marginalTaxRate.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-400">Effective Tax Rate: </span>
              <span className="text-gray-100">{result.federal.effectiveTaxRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* California Tax Breakdown */}
      {includeCaliforniaTax && result.california && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">California Tax Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Income</span>
              <span className="text-gray-100">${result.california.totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Adjusted Gross Income (AGI)</span>
              <span className="text-gray-100">${result.california.adjustedGrossIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Deduction ({result.california.deductionType})</span>
              <span className="text-gray-100">-${result.california.deductionAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
              <span className="text-gray-400">Taxable Income</span>
              <span className="text-gray-100">${result.california.taxableIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Tax Liability</span>
              <span className="text-gray-100">${result.california.totalTaxLiability.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Withholdings</span>
              <span className="text-gray-100">-${result.california.totalWithholdings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Estimated Payments</span>
              <span className="text-gray-100">-${result.california.totalEstimatedPayments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
              <span className="text-gray-400 font-semibold">Tax Owed/Refund</span>
              <span className={`font-semibold ${result.california.taxOwedOrRefund > 0 ? 'text-red-400' : 'text-green-400'}`}>
                ${Math.abs(result.california.taxOwedOrRefund).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
              <div>
                <span className="text-gray-400">Marginal Tax Rate: </span>
                <span className="text-gray-100">{result.california.marginalTaxRate.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-gray-400">Effective Tax Rate: </span>
                <span className="text-gray-100">{result.california.effectiveTaxRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Payments */}
      {(result.suggestedPayments.federal.length > 0 || 
        (includeCaliforniaTax && result.suggestedPayments.california && result.suggestedPayments.california.length > 0)) && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Suggested Remaining Estimated Payments</h3>
          
          {result.suggestedPayments.federal.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-200 mb-2">Federal</h4>
              <div className="space-y-2">
                {result.suggestedPayments.federal.map((payment) => (
                  <div key={payment.quarter} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {payment.quarter} - Due {new Date(payment.dueDate).toLocaleDateString()}
                    </span>
                    <span className="text-gray-100 font-medium">${payment.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {includeCaliforniaTax && result.suggestedPayments.california && result.suggestedPayments.california.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-200 mb-2">California</h4>
              <div className="space-y-2">
                {result.suggestedPayments.california.map((payment) => (
                  <div key={payment.quarter} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {payment.quarter} - Due {new Date(payment.dueDate).toLocaleDateString()}
                    </span>
                    <span className="text-gray-100 font-medium">${payment.amount.toLocaleString()}</span>
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
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Previous
        </button>
      </div>
    </div>
  );
}
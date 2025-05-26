import React from 'react';
import { TaxCalculationResult } from '../types';

interface TaxOwedDisplayProps {
  result: TaxCalculationResult | null;
  includeCaliforniaTax: boolean;
}

export function TaxOwedDisplay({ result, includeCaliforniaTax }: TaxOwedDisplayProps) {
  if (!result) return null;

  const federalOwed = result.federal.taxOwedOrRefund;
  const californiaOwed = result.california?.taxOwedOrRefund || 0;
  const totalOwed = federalOwed + (includeCaliforniaTax ? californiaOwed : 0);

  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Estimated Tax Status</p>
          <p className={`text-2xl font-bold ${totalOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {totalOwed > 0 ? 'Owe' : 'Refund'}: ${Math.abs(totalOwed).toLocaleString()}
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm">
            <span className="text-gray-600">Federal:</span>{' '}
            <span className={federalOwed > 0 ? 'text-red-600' : 'text-green-600'}>
              ${Math.abs(federalOwed).toLocaleString()}
            </span>
          </p>
          {includeCaliforniaTax && (
            <p className="text-sm">
              <span className="text-gray-600">California:</span>{' '}
              <span className={californiaOwed > 0 ? 'text-red-600' : 'text-green-600'}>
                ${Math.abs(californiaOwed).toLocaleString()}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
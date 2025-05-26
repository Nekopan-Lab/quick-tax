import { useStore } from '../../store/useStore'
import { 
  calculateComprehensiveTax, 
  calculateCaliforniaWithholdings,
  calculateFederalEstimatedPayments,
  calculateCaliforniaEstimatedPayments
} from '../../utils/taxCalculations'
import { TaxYear } from '../../types'

interface SummaryProps {
  onPrevious: () => void
}

export function Summary({ onPrevious }: SummaryProps) {
  const { 
    taxYear,
    filingStatus,
    includeCaliforniaTax,
    deductions,
    userIncome,
    spouseIncome,
    estimatedPayments
  } = useStore()

  // Calculate real tax data
  const taxResults = calculateComprehensiveTax(
    taxYear as TaxYear,
    filingStatus,
    includeCaliforniaTax,
    deductions,
    userIncome,
    spouseIncome,
    estimatedPayments
  )

  // Show message if calculations can't be performed
  if (!taxResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Summary & Actionable Insights</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            Please complete the previous steps (Filing Status) to see your tax calculation summary.
          </p>
        </div>
        <div className="flex justify-between mt-8">
          <button
            onClick={onPrevious}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
        </div>
      </div>
    )
  }

  const federalOwed = taxResults.federalOwedOrRefund
  const caOwed = taxResults.californiaOwedOrRefund || 0
  
  // Calculate California withholdings separately for display
  const californiaWithholdings = includeCaliforniaTax 
    ? calculateCaliforniaWithholdings(userIncome, spouseIncome, filingStatus)
    : 0
    
  // Calculate suggested estimated payments
  const federalSuggestions = calculateFederalEstimatedPayments(federalOwed, estimatedPayments)
  const californiaSuggestions = includeCaliforniaTax 
    ? calculateCaliforniaEstimatedPayments(caOwed, estimatedPayments)
    : []
    
  // Check if all payments have been made
  const allFederalPaid = federalSuggestions.every(s => s.isPaid)
  const allCaliforniaPaid = californiaSuggestions.every(s => s.isPaid)

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Summary & Actionable Insights</h2>
      
      {/* Tax Owed/Overpaid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
          federalOwed > 0 ? 'border-red-200' : 'border-green-200'
        }`}>
          <h3 className="text-lg font-medium mb-2">Federal Tax</h3>
          <p className="text-3xl font-bold mb-1">
            {federalOwed > 0 ? (
              <span className="text-red-600">${federalOwed.toLocaleString()} Owed</span>
            ) : (
              <span className="text-green-600">${Math.abs(federalOwed).toLocaleString()} Overpaid</span>
            )}
          </p>
          <p className="text-sm text-gray-600">As of current date</p>
        </div>

        {includeCaliforniaTax && (
          <div className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
            caOwed > 0 ? 'border-red-200' : 'border-green-200'
          }`}>
            <h3 className="text-lg font-medium mb-2">California Tax</h3>
            <p className="text-3xl font-bold mb-1">
              {caOwed > 0 ? (
                <span className="text-red-600">${caOwed.toLocaleString()} Owed</span>
              ) : (
                <span className="text-green-600">${Math.abs(caOwed).toLocaleString()} Overpaid</span>
              )}
            </p>
            <p className="text-sm text-gray-600">As of current date</p>
          </div>
        )}
      </div>

      {/* Tax Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Tax Calculation Breakdown</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span>Total Income</span>
            <span className="font-medium">${taxResults.totalIncome.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Adjusted Gross Income (AGI)</span>
            <span className="font-medium">${taxResults.adjustedGrossIncome.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Deduction Applied ({taxResults.deductionType})</span>
            <span className="font-medium">${taxResults.deductionAmount.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Taxable Income</span>
            <span className="font-medium">${taxResults.taxableIncome.toLocaleString()}</span>
          </div>
        </div>

        {/* Federal Tax Details */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium mb-3">Federal Tax Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tax Liability (before withholdings)</span>
              <span className="font-medium">${taxResults.federalTax.totalTax.toLocaleString()}</span>
            </div>
            <div className="pl-4 space-y-1 text-gray-600">
              <div>• Ordinary Income Tax: ${taxResults.federalTax.ordinaryIncomeTax.toLocaleString()}</div>
              <div>• Long-Term Capital Gains Tax: ${taxResults.federalTax.capitalGainsTax.toLocaleString()}</div>
            </div>
            <div className="flex justify-between pt-2">
              <span>Total Withholdings</span>
              <span className="font-medium">-${taxResults.totalWithholdings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Payments Made</span>
              <span className="font-medium">-${taxResults.totalEstimatedPayments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-medium">
              <span>Net Tax Owed/Overpaid</span>
              <span className={federalOwed > 0 ? 'text-red-600' : 'text-green-600'}>
                ${Math.abs(federalOwed).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* California Tax Details */}
        {includeCaliforniaTax && taxResults.californiaTax && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3">California Tax Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tax Liability (before withholdings)</span>
                <span className="font-medium">${taxResults.californiaTax.totalTax.toLocaleString()}</span>
              </div>
              <div className="pl-4 space-y-1 text-gray-600">
                <div>• Base CA Tax: ${taxResults.californiaTax.baseTax.toLocaleString()}</div>
                {taxResults.californiaTax.mentalHealthTax > 0 && (
                  <div>• Mental Health Tax (1%): ${taxResults.californiaTax.mentalHealthTax.toLocaleString()}</div>
                )}
              </div>
              <div className="flex justify-between pt-2">
                <span>Total Withholdings</span>
                <span className="font-medium">-${californiaWithholdings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Payments Made</span>
                <span className="font-medium">-${((parseFloat(estimatedPayments.californiaQ1) || 0) + (parseFloat(estimatedPayments.californiaQ2) || 0) + (parseFloat(estimatedPayments.californiaQ4) || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-medium">
                <span>Net Tax Owed/Overpaid</span>
                <span className={caOwed > 0 ? 'text-red-600' : 'text-green-600'}>
                  ${Math.abs(caOwed).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estimated Payments Status & Suggestions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Estimated Tax Payments</h3>
        
        {/* Federal Payments */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Federal (IRS)</h4>
          
          {allFederalPaid && federalOwed !== 0 ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
              <p className="font-medium mb-2">
                All quarterly payments have been made.
              </p>
              <p className="text-sm">
                Based on current data, you would 
                {federalOwed > 0 ? (
                  <span className="font-medium text-red-600"> owe ${federalOwed.toLocaleString()}</span>
                ) : (
                  <span className="font-medium text-green-600"> be refunded ${Math.abs(federalOwed).toLocaleString()}</span>
                )} when filing taxes.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                This is an estimation only and not professional tax advice.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {federalSuggestions.map((payment) => (
                <div key={payment.quarter} className={`flex justify-between items-center p-3 rounded-md ${
                  payment.isPaid ? 'bg-green-50 border border-green-200' : 
                  payment.isPastDue ? 'bg-gray-50 border border-gray-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {payment.isPaid && (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={payment.isPaid ? 'font-medium' : payment.isPastDue ? 'text-gray-500' : ''}>
                      {payment.quarter} - {payment.dueDate}
                    </span>
                    {payment.isPaid && <span className="text-sm text-green-600">(Paid)</span>}
                    {payment.isPastDue && <span className="text-sm text-gray-500">(Past Due)</span>}
                  </div>
                  <span className={`font-medium ${
                    payment.isPaid ? 'text-green-700' : 
                    payment.isPastDue ? 'text-gray-500' :
                    'text-blue-700'
                  }`}>
                    ${Math.round(payment.amount).toLocaleString()}
                  </span>
                </div>
              ))}
              
              {federalOwed <= 0 && !allFederalPaid && (
                <p className="text-sm text-gray-600 mt-2">
                  No additional payments needed - you're on track for a refund.
                </p>
              )}
            </div>
          )}
        </div>

        {/* California Payments */}
        {includeCaliforniaTax && (
          <div>
            <h4 className="font-medium mb-3">California (FTB)</h4>
            
            {allCaliforniaPaid && caOwed !== 0 ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                <p className="font-medium mb-2">
                  All quarterly payments have been made.
                </p>
                <p className="text-sm">
                  Based on current data, you would 
                  {caOwed > 0 ? (
                    <span className="font-medium text-red-600"> owe ${caOwed.toLocaleString()}</span>
                  ) : (
                    <span className="font-medium text-green-600"> be refunded ${Math.abs(caOwed).toLocaleString()}</span>
                  )} when filing taxes.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  This is an estimation only and not professional tax advice.
                </p>
              </div>
            ) : (
              <div>
                <div className="space-y-2">
                  {californiaSuggestions.map((payment) => (
                    <div key={payment.quarter} className={`flex justify-between items-center p-3 rounded-md ${
                      payment.isPaid ? 'bg-green-50 border border-green-200' : 
                      payment.isPastDue ? 'bg-gray-50 border border-gray-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {payment.isPaid && (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className={payment.isPaid ? 'font-medium' : payment.isPastDue ? 'text-gray-500' : ''}>
                          {payment.quarter} - {payment.dueDate}
                        </span>
                        {payment.isPaid && <span className="text-sm text-green-600">(Paid)</span>}
                        {payment.isPastDue && <span className="text-sm text-gray-500">(Past Due)</span>}
                      </div>
                      <span className={`font-medium ${
                        payment.isPaid ? 'text-green-700' : 
                        payment.isPastDue ? 'text-gray-500' :
                        'text-blue-700'
                      }`}>
                        ${Math.round(payment.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  
                  {caOwed <= 0 && !allCaliforniaPaid && (
                    <p className="text-sm text-gray-600 mt-2">
                      No additional payments needed - you're on track for a refund.
                    </p>
                  )}
                </div>
                
                {caOwed > 0 && !allCaliforniaPaid && (
                  <p className="text-xs text-gray-600 mt-3">
                    * California uses weighted percentages for estimated payments
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Print Summary
        </button>
      </div>
    </div>
  )
}
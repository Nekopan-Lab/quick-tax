interface SummaryProps {
  onPrevious: () => void
}

export function Summary({ onPrevious }: SummaryProps) {
  const includeCA = true // TODO: Get from store

  // Mock data for display
  const federalOwed = 15000
  const caOwed = 5000
  const totalIncome = 250000
  const agi = 245000
  const deductionType = 'Standard'
  const deductionAmount = 30000
  const taxableIncome = 215000
  const federalTaxLiability = 45000
  const caTaxLiability = 15000
  const totalWithholdings = 30000
  const totalEstimatedPayments = 0

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

        {includeCA && (
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
            <span className="font-medium">${totalIncome.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Adjusted Gross Income (AGI)</span>
            <span className="font-medium">${agi.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Deduction Applied ({deductionType})</span>
            <span className="font-medium">${deductionAmount.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b">
            <span>Taxable Income</span>
            <span className="font-medium">${taxableIncome.toLocaleString()}</span>
          </div>
        </div>

        {/* Federal Tax Details */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium mb-3">Federal Tax Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tax Liability (before withholdings)</span>
              <span className="font-medium">${federalTaxLiability.toLocaleString()}</span>
            </div>
            <div className="pl-4 space-y-1 text-gray-600">
              <div>• Ordinary Income Tax: $40,000</div>
              <div>• Long-Term Capital Gains Tax: $5,000</div>
            </div>
            <div className="flex justify-between pt-2">
              <span>Total Withholdings</span>
              <span className="font-medium">-${totalWithholdings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Payments Made</span>
              <span className="font-medium">-${totalEstimatedPayments.toLocaleString()}</span>
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
        {includeCA && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3">California Tax Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tax Liability (before withholdings)</span>
                <span className="font-medium">${caTaxLiability.toLocaleString()}</span>
              </div>
              <div className="pl-4 space-y-1 text-gray-600">
                <div>• All income taxed at CA marginal rates</div>
              </div>
              <div className="flex justify-between pt-2">
                <span>Total Withholdings</span>
                <span className="font-medium">-$10,000</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Payments Made</span>
                <span className="font-medium">-$0</span>
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

      {/* Suggested Estimated Payments */}
      {(federalOwed > 0 || caOwed > 0) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">Suggested Remaining Estimated Payments</h3>
          
          {federalOwed > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-3">Federal (IRS)</h4>
              <div className="bg-blue-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span>Q2 - June 16, 2025</span>
                  <span className="font-medium">${(federalOwed / 3).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Q3 - September 15, 2025</span>
                  <span className="font-medium">${(federalOwed / 3).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Q4 - January 15, 2026</span>
                  <span className="font-medium">${(federalOwed / 3).toFixed(0)}</span>
                </div>
              </div>
            </div>
          )}

          {includeCA && caOwed > 0 && (
            <div>
              <h4 className="font-medium mb-3">California (FTB)</h4>
              <div className="bg-blue-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span>Q2 - June 16, 2025 (40%)</span>
                  <span className="font-medium">${(caOwed * 0.4).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Q4 - January 15, 2026 (30%)</span>
                  <span className="font-medium">${(caOwed * 0.3).toFixed(0)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                * California uses weighted percentages for estimated payments
              </p>
            </div>
          )}
        </div>
      )}

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
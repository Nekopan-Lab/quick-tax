import { useStore } from '../../store/useStore'
import { numberInputProps } from '../../utils/inputHelpers'
import { 
  calculateTotalFederalEstimatedPayments,
  calculateTotalCaliforniaEstimatedPayments
} from '../../calculators/orchestrator'

interface EstimatedPaymentsProps {
  onNext: () => void
  onPrevious: () => void
}

export function EstimatedPayments({ onNext, onPrevious }: EstimatedPaymentsProps) {
  const { includeCaliforniaTax, estimatedPayments, setEstimatedPayments } = useStore()

  const totalFederal = calculateTotalFederalEstimatedPayments(estimatedPayments)
  const totalCA = calculateTotalCaliforniaEstimatedPayments(estimatedPayments)

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Estimated Tax Payments YTD</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
        <div className="bg-emerald-50 p-4 rounded-md">
          <p className="text-sm text-emerald-800">
            Enter any estimated tax payments you've already made for the 2025 tax year.
            Leave blank if you haven't made any payments.
          </p>
        </div>

        {/* Federal Estimated Payments */}
        <div>
          <h3 className="text-lg font-medium mb-4">Federal (IRS) Estimated Tax Payments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Q1 Payment (Due April 15, 2025)
              </label>
              <input
                type="number" {...numberInputProps}
                value={estimatedPayments.federalQ1}
                onChange={(e) => setEstimatedPayments({ federalQ1: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Q2 Payment (Due June 16, 2025)
              </label>
              <input
                type="number" {...numberInputProps}
                value={estimatedPayments.federalQ2}
                onChange={(e) => setEstimatedPayments({ federalQ2: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Q3 Payment (Due September 15, 2025)
              </label>
              <input
                type="number" {...numberInputProps}
                value={estimatedPayments.federalQ3}
                onChange={(e) => setEstimatedPayments({ federalQ3: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Q4 Payment (Due January 15, 2026)
              </label>
              <input
                type="number" {...numberInputProps}
                value={estimatedPayments.federalQ4}
                onChange={(e) => setEstimatedPayments({ federalQ4: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <span className="font-medium text-sm">Total Federal Payments:</span>
            <span className="font-semibold">${totalFederal.toLocaleString()}</span>
          </div>
        </div>

        {/* California Estimated Payments */}
        {includeCaliforniaTax && (
          <div>
            <h3 className="text-lg font-medium mb-4">California (FTB) Estimated Tax Payments</h3>
            <div className="bg-amber-50 p-3 rounded-md mb-4">
              <p className="text-xs text-amber-800">
                Note: California has 3 payment dates with weighted percentages (30%, 40%, 0%, 30%)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Q1 Payment (Due April 15, 2025)
                  <span className="text-xs text-gray-500 ml-1">(30% of annual)</span>
                </label>
                <input
                  type="number" {...numberInputProps}
                  value={estimatedPayments.californiaQ1}
                  onChange={(e) => setEstimatedPayments({ californiaQ1: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Q2 Payment (Due June 16, 2025)
                  <span className="text-xs text-gray-500 ml-1">(40% of annual)</span>
                </label>
                <input
                  type="number" {...numberInputProps}
                  value={estimatedPayments.californiaQ2}
                  onChange={(e) => setEstimatedPayments({ californiaQ2: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Q3 Payment
                  <span className="text-xs text-gray-500 ml-1">(No payment due)</span>
                </label>
                <input
                  type="text"
                  value="No payment due"
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Q4 Payment (Due January 15, 2026)
                  <span className="text-xs text-gray-500 ml-1">(30% of annual)</span>
                </label>
                <input
                  type="number" {...numberInputProps}
                  value={estimatedPayments.californiaQ4}
                  onChange={(e) => setEstimatedPayments({ californiaQ4: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <span className="font-medium text-sm">Total California Payments:</span>
              <span className="font-semibold">${totalCA.toLocaleString()}</span>
            </div>
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
          onClick={onNext}
          className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Next
        </button>
      </div>
    </div>
  )
}
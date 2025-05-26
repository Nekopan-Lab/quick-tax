import { useState } from 'react'

interface EstimatedPaymentsProps {
  onNext: () => void
  onPrevious: () => void
}

export function EstimatedPayments({ onNext, onPrevious }: EstimatedPaymentsProps) {
  // Federal estimated payments
  const [fedQ1, setFedQ1] = useState('')
  const [fedQ2, setFedQ2] = useState('')
  const [fedQ3, setFedQ3] = useState('')
  const [fedQ4, setFedQ4] = useState('')

  // California estimated payments
  const [caQ1, setCaQ1] = useState('')
  const [caQ2, setCaQ2] = useState('')
  const [caQ4, setCaQ4] = useState('')

  const includeCA = true // TODO: Get from store

  const totalFederal = Number(fedQ1) + Number(fedQ2) + Number(fedQ3) + Number(fedQ4)
  const totalCA = Number(caQ1) + Number(caQ2) + Number(caQ4)

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Estimated Tax Payments YTD</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
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
                type="number"
                value={fedQ1}
                onChange={(e) => setFedQ1(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Q2 Payment (Due June 16, 2025)
              </label>
              <input
                type="number"
                value={fedQ2}
                onChange={(e) => setFedQ2(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Q3 Payment (Due September 15, 2025)
              </label>
              <input
                type="number"
                value={fedQ3}
                onChange={(e) => setFedQ3(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Q4 Payment (Due January 15, 2026)
              </label>
              <input
                type="number"
                value={fedQ4}
                onChange={(e) => setFedQ4(e.target.value)}
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
        {includeCA && (
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
                  type="number"
                  value={caQ1}
                  onChange={(e) => setCaQ1(e.target.value)}
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
                  type="number"
                  value={caQ2}
                  onChange={(e) => setCaQ2(e.target.value)}
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
                  type="number"
                  value={caQ4}
                  onChange={(e) => setCaQ4(e.target.value)}
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
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  )
}
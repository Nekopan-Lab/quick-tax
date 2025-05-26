import { useStore } from '../../store/useStore'

interface DeductionsProps {
  onNext: () => void
  onPrevious: () => void
}

export function Deductions({ onNext, onPrevious }: DeductionsProps) {
  const { 
    includeCaliforniaTax, 
    filingStatus, 
    deductions, 
    setDeductions 
  } = useStore()

  // Standard deduction values based on filing status
  const federalStandardDeduction = filingStatus === 'marriedFilingJointly' ? 30000 : 15000
  const caStandardDeduction = filingStatus === 'marriedFilingJointly' ? 11080 : 5540
  
  const totalItemized = 
    Number(deductions.propertyTax) + 
    Number(deductions.mortgageInterest) + 
    Number(deductions.donations)

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Deductions</h2>
      
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
            <p className="text-sm text-blue-800">
              Enter your estimated <strong>full-year</strong> amounts below. We'll automatically determine whether standard or itemized deductions are better for you.
            </p>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Tax (Full Year)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={deductions.propertyTax}
                  onChange={(e) => setDeductions({ propertyTax: e.target.value })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mortgage Interest (Full Year)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={deductions.mortgageInterest}
                  onChange={(e) => setDeductions({ mortgageInterest: e.target.value })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Charitable Donations (Full Year)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={deductions.donations}
                  onChange={(e) => setDeductions({ donations: e.target.value })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-xl p-4 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-4">
              Deduction Comparison
            </h3>
            
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Your Itemized Deductions:</span>
                  <span className="text-lg sm:text-2xl font-bold text-gray-900">${totalItemized.toLocaleString()}</span>
                </div>
              </div>

              <div className={`grid gap-3 ${includeCaliforniaTax ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                <div className={`rounded-lg p-3 sm:p-4 border-2 transition-all ${
                  totalItemized > federalStandardDeduction 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm sm:text-base text-gray-900">Federal (IRS)</span>
                    {totalItemized > federalStandardDeduction ? (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">ITEMIZED</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">STANDARD</span>
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    ${Math.max(totalItemized, federalStandardDeduction).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    Standard: ${federalStandardDeduction.toLocaleString()}
                  </div>
                </div>

                {includeCaliforniaTax && (
                  <div className={`rounded-lg p-3 sm:p-4 border-2 transition-all ${
                    totalItemized > caStandardDeduction 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm sm:text-base text-gray-900">California (FTB)</span>
                      {totalItemized > caStandardDeduction ? (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">ITEMIZED</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">STANDARD</span>
                      )}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      ${Math.max(totalItemized, caStandardDeduction).toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      Standard: ${caStandardDeduction.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
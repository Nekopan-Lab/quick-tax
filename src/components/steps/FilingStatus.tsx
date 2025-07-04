import { useStore } from '../../store/useStore'

interface FilingStatusProps {
  onNext: () => void
}

// Available tax years - can easily add more years in the future
const AVAILABLE_TAX_YEARS = [2025] as const

export function FilingStatus({ onNext }: FilingStatusProps) {
  const { taxYear, setTaxYear, filingStatus, setFilingStatus, includeCaliforniaTax, setIncludeCaliforniaTax } = useStore()

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Filing Status & Tax Scope</h2>
      
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tax Year
            </h3>
            <div className="flex gap-4 mb-2">
              {AVAILABLE_TAX_YEARS.map(year => (
                <label key={year} className={`
                  relative flex items-center px-6 py-3 border-2 rounded-xl cursor-pointer transition-all
                  ${taxYear === year 
                    ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                `}>
                  <input
                    type="radio"
                    name="taxYear"
                    value={year}
                    checked={taxYear === year}
                    onChange={() => setTaxYear(year)}
                    className="sr-only"
                  />
                  <span className="font-semibold text-gray-900">{year}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Your Filing Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`
                relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all
                ${filingStatus === 'single'
                  ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}>
                <input
                  type="radio"
                  name="filingStatus"
                  value="single"
                  checked={filingStatus === 'single'}
                  onChange={() => setFilingStatus('single')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className={`
                    w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center
                    ${filingStatus === 'single' ? 'border-emerald-500' : 'border-gray-300'}
                  `}>
                    {filingStatus === 'single' && (
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Single</span>
                    <p className="text-sm text-gray-500 mt-1">For unmarried individuals</p>
                  </div>
                </div>
              </label>
              
              <label className={`
                relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all
                ${filingStatus === 'marriedFilingJointly' 
                  ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}>
                <input
                  type="radio"
                  name="filingStatus"
                  value="marriedFilingJointly"
                  checked={filingStatus === 'marriedFilingJointly'}
                  onChange={() => setFilingStatus('marriedFilingJointly')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className={`
                    w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center
                    ${filingStatus === 'marriedFilingJointly' ? 'border-emerald-500' : 'border-gray-300'}
                  `}>
                    {filingStatus === 'marriedFilingJointly' && (
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Married Filing Jointly</span>
                    <p className="text-sm text-gray-500 mt-1">For married couples filing together</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Tax Jurisdictions
            </h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">Federal Tax (IRS)</h4>
                <p className="text-sm text-gray-600">Always calculated</p>
              </div>
              
              <div className="border-t pt-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                      California State Tax (FTB)
                    </h4>
                    <p className="text-sm text-gray-600">Include California state tax calculations</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={includeCaliforniaTax}
                      onChange={(e) => setIncludeCaliforniaTax(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`
                      w-14 h-8 rounded-full transition-colors duration-200 relative
                      ${includeCaliforniaTax ? 'bg-emerald-600' : 'bg-gray-300'}
                    `}>
                      <div className={`
                        absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200
                        ${includeCaliforniaTax ? 'translate-x-7' : 'translate-x-1'}
                      `} />
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end mt-8">
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
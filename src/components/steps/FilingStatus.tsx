import { useState } from 'react'

interface FilingStatusProps {
  onNext: () => void
  onPrevious: () => void
}

export function FilingStatus({ onNext, onPrevious }: FilingStatusProps) {
  const [filingStatus, setFilingStatus] = useState<'single' | 'married' | ''>('single')
  const [includeCA, setIncludeCA] = useState(true)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Filing Status & Tax Scope</h2>
          <p className="text-blue-100 mt-2">Let's start with your basic tax information</p>
        </div>
        
        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">1</span>
              Select Your Filing Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`
                relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all
                ${filingStatus === 'single' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}>
                <input
                  type="radio"
                  name="filingStatus"
                  value="single"
                  checked={filingStatus === 'single'}
                  onChange={(e) => setFilingStatus(e.target.value as 'single')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className={`
                    w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center
                    ${filingStatus === 'single' ? 'border-blue-500' : 'border-gray-300'}
                  `}>
                    {filingStatus === 'single' && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
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
                ${filingStatus === 'married' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}>
                <input
                  type="radio"
                  name="filingStatus"
                  value="married"
                  checked={filingStatus === 'married'}
                  onChange={(e) => setFilingStatus(e.target.value as 'married')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className={`
                    w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center
                    ${filingStatus === 'married' ? 'border-blue-500' : 'border-gray-300'}
                  `}>
                    {filingStatus === 'married' && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">2</span>
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
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      California State Tax (FTB)
                    </h4>
                    <p className="text-sm text-gray-600">Include California state tax calculations</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={includeCA}
                      onChange={(e) => setIncludeCA(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`
                      w-14 h-8 rounded-full transition-colors duration-200 relative
                      ${includeCA ? 'bg-blue-600' : 'bg-gray-300'}
                    `}>
                      <div className={`
                        absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200
                        ${includeCA ? 'translate-x-7' : 'translate-x-1'}
                      `} />
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
          <button
            onClick={onPrevious}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:shadow-sm transition-all font-medium"
          >
            Previous
          </button>
          <button
            onClick={onNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
          >
            Continue to Deductions →
          </button>
        </div>
      </div>
    </div>
  )
}
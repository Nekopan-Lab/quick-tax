import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { getFederalStandardDeduction } from '../../calculators/federal/calculator'
import { getCaliforniaStandardDeduction } from '../../calculators/california/calculator'
import { 
  calculateFederalItemizedDeductions, 
  calculateCaliforniaItemizedDeductions,
  calculateEstimatedCAStateTax
} from '../../utils/taxCalculations'
import { TaxYear } from '../../types'

interface DeductionsProps {
  onNext: () => void
  onPrevious: () => void
}

export function Deductions({ onNext, onPrevious }: DeductionsProps) {
  const { 
    includeCaliforniaTax, 
    filingStatus, 
    taxYear,
    deductions, 
    setDeductions,
    userIncome,
    spouseIncome
  } = useStore()
  
  const [expandedFederal, setExpandedFederal] = useState(false)
  const [expandedCalifornia, setExpandedCalifornia] = useState(false)

  // Standard deduction values based on filing status and tax year
  const federalStandardDeduction = filingStatus ? 
    getFederalStandardDeduction(taxYear as TaxYear, filingStatus) : 0
  const caStandardDeduction = filingStatus ? 
    getCaliforniaStandardDeduction(taxYear as TaxYear, filingStatus) : 0
  
  // Calculate itemized deductions with SALT cap and mortgage limits
  const federalItemized = calculateFederalItemizedDeductions(
    deductions,
    userIncome,
    spouseIncome,
    filingStatus,
    includeCaliforniaTax,
    taxYear as TaxYear
  )
  
  const californiaItemized = calculateCaliforniaItemizedDeductions(deductions)
  
  // Calculate components for display
  const propertyTax = parseFloat(deductions.propertyTax) || 0
  const mortgageInterest = parseFloat(deductions.mortgageInterest) || 0
  const donations = parseFloat(deductions.donations) || 0
  const otherStateIncomeTax = parseFloat(deductions.otherStateIncomeTax) || 0
  const mortgageBalance = parseFloat(deductions.mortgageBalance) || 0
  
  // Calculate estimated CA state tax if CA is selected
  const estimatedCAStateTax = includeCaliforniaTax ? 
    calculateEstimatedCAStateTax(userIncome, spouseIncome, filingStatus, taxYear as TaxYear) : 0
  
  // Calculate SALT for federal
  const saltDeduction = propertyTax + (includeCaliforniaTax ? estimatedCAStateTax : otherStateIncomeTax)
  const saltCapped = Math.min(saltDeduction, 10000)
  
  // Calculate mortgage interest with federal cap
  const federalMortgageLimit = deductions.mortgageLoanDate === 'before-dec-16-2017' ? 1000000 : 750000
  const federalEffectiveMortgageInterest = mortgageBalance > federalMortgageLimit && mortgageBalance > 0
    ? mortgageInterest * (federalMortgageLimit / mortgageBalance)
    : mortgageInterest
    
  // Calculate mortgage interest with CA cap
  const californiaMortgageLimit = 1000000
  const californiaEffectiveMortgageInterest = mortgageBalance > californiaMortgageLimit && mortgageBalance > 0
    ? mortgageInterest * (californiaMortgageLimit / mortgageBalance)
    : mortgageInterest

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
              
              {/* Mortgage details - only show if mortgage interest is entered */}
              {Number(deductions.mortgageInterest) > 0 && (
                <div className="mt-4 space-y-4 ml-4 pl-4 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      When was your mortgage obtained?
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="before-dec-16-2017"
                          checked={deductions.mortgageLoanDate === 'before-dec-16-2017'}
                          onChange={(e) => setDeductions({ mortgageLoanDate: e.target.value as 'before-dec-16-2017' | 'after-dec-15-2017' | '' })}
                          className="mr-2"
                        />
                        <span className="text-sm">Before December 16, 2017</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="after-dec-15-2017"
                          checked={deductions.mortgageLoanDate === 'after-dec-15-2017'}
                          onChange={(e) => setDeductions({ mortgageLoanDate: e.target.value as 'before-dec-16-2017' | 'after-dec-15-2017' | '' })}
                          className="mr-2"
                        />
                        <span className="text-sm">After December 15, 2017</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This affects your federal deduction limit ($1M before, $750K after)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Mortgage Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={deductions.mortgageBalance}
                        onChange={(e) => setDeductions({ mortgageBalance: e.target.value })}
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
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
            
            {/* Other State Income Tax - only show if CA tax not selected */}
            {!includeCaliforniaTax && (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated State Income Tax (Full Year)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={deductions.otherStateIncomeTax}
                    onChange={(e) => setDeductions({ otherStateIncomeTax: e.target.value })}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Enter your estimated state income tax payments for states other than California
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 bg-gray-50 rounded-xl p-4 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-4">
              Deduction Comparison
            </h3>
            
            <div className="space-y-3">
              <div className={`grid gap-3 ${includeCaliforniaTax ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                <div className={`rounded-lg p-3 sm:p-4 border-2 transition-all ${
                  federalItemized > federalStandardDeduction 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm sm:text-base text-gray-900">Federal (IRS)</span>
                    {federalItemized > federalStandardDeduction ? (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">ITEMIZED</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">STANDARD</span>
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    ${Math.max(federalItemized, federalStandardDeduction).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    Standard: ${federalStandardDeduction.toLocaleString()}
                  </div>
                  <button
                    onClick={() => setExpandedFederal(!expandedFederal)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>{expandedFederal ? 'Hide' : 'Show'} itemized breakdown</span>
                    <svg className={`w-3 h-3 transition-transform ${expandedFederal ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedFederal && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Property Tax:</span>
                        <span>${propertyTax.toLocaleString()}</span>
                      </div>
                      {includeCaliforniaTax && (
                        <div className="flex justify-between">
                          <span>Est. CA State Tax:</span>
                          <span>${Math.round(estimatedCAStateTax).toLocaleString()}</span>
                        </div>
                      )}
                      {!includeCaliforniaTax && otherStateIncomeTax > 0 && (
                        <div className="flex justify-between">
                          <span>State Income Tax:</span>
                          <span>${otherStateIncomeTax.toLocaleString()}</span>
                        </div>
                      )}
                      {saltDeduction > 10000 && (
                        <div className="flex justify-between text-orange-600 font-medium">
                          <span>SALT Cap Applied:</span>
                          <span>${saltCapped.toLocaleString()} (max $10,000)</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1">
                        <span>Mortgage Interest:</span>
                        <span>${mortgageInterest.toLocaleString()}</span>
                      </div>
                      {mortgageBalance > federalMortgageLimit && mortgageBalance > 0 && (
                        <div className="flex justify-between text-orange-600 text-xs pl-3">
                          <span>→ Limited to ${federalMortgageLimit.toLocaleString()} loan:</span>
                          <span>${Math.round(federalEffectiveMortgageInterest).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Donations:</span>
                        <span>${donations.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-1 border-t">
                        <span>Total Federal Itemized:</span>
                        <span className={federalItemized < federalStandardDeduction ? 'text-gray-500' : ''}>
                          ${federalItemized.toLocaleString()}
                        </span>
                      </div>
                      {federalItemized < federalStandardDeduction && (
                        <div className="text-xs text-gray-500 mt-1">
                          Itemized (${federalItemized.toLocaleString()}) is less than standard (${federalStandardDeduction.toLocaleString()})
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {includeCaliforniaTax && (
                  <div className={`rounded-lg p-3 sm:p-4 border-2 transition-all ${
                    californiaItemized > caStandardDeduction 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm sm:text-base text-gray-900">California (FTB)</span>
                      {californiaItemized > caStandardDeduction ? (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">ITEMIZED</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">STANDARD</span>
                      )}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      ${Math.max(californiaItemized, caStandardDeduction).toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      Standard: ${caStandardDeduction.toLocaleString()}
                    </div>
                    <button
                      onClick={() => setExpandedCalifornia(!expandedCalifornia)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>{expandedCalifornia ? 'Hide' : 'Show'} itemized breakdown</span>
                      <svg className={`w-3 h-3 transition-transform ${expandedCalifornia ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedCalifornia && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Property Tax:</span>
                          <span>${propertyTax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mortgage Interest:</span>
                          <span>${mortgageInterest.toLocaleString()}</span>
                        </div>
                        {mortgageBalance > californiaMortgageLimit && mortgageBalance > 0 && (
                          <div className="flex justify-between text-orange-600 text-xs pl-3">
                            <span>→ Limited to $1M loan:</span>
                            <span>${Math.round(californiaEffectiveMortgageInterest).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Donations:</span>
                          <span>${donations.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-1 border-t">
                          <span>Total CA Itemized:</span>
                          <span className={californiaItemized < caStandardDeduction ? 'text-gray-500' : ''}>
                            ${californiaItemized.toLocaleString()}
                          </span>
                        </div>
                        {californiaItemized < caStandardDeduction && (
                          <div className="text-xs text-gray-500 mt-1">
                            Itemized (${californiaItemized.toLocaleString()}) is less than standard (${caStandardDeduction.toLocaleString()})
                          </div>
                        )}
                      </div>
                    )}
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
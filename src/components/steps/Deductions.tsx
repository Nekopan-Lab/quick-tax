import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { getFederalStandardDeduction } from '../../calculators/federal/calculator'
import { getCaliforniaStandardDeduction } from '../../calculators/california/calculator'
import type { TaxCalculationResult } from '../../calculators/orchestrator'
import { TaxYear } from '../../types'
import { numberInputProps } from '../../utils/inputHelpers'

interface DeductionsProps {
  onNext: () => void
  onPrevious: () => void
  taxResults: TaxCalculationResult | null
}

// Whole-dollar currency formatting for display
const fmt = (value: number) => Math.round(value).toLocaleString()

export function Deductions({ onNext, onPrevious, taxResults }: DeductionsProps) {
  const { 
    includeCaliforniaTax, 
    filingStatus, 
    taxYear,
    deductions, 
    setDeductions
  } = useStore()
  
  const [expandedFederal, setExpandedFederal] = useState(false)
  const [expandedCalifornia, setExpandedCalifornia] = useState(false)

  // All deduction math comes from the calculation layer (orchestrator)
  const federal = taxResults?.deductions.federal
  const california = taxResults?.deductions.california

  const federalStandardDeduction = federal?.standardDeduction ??
    getFederalStandardDeduction(taxYear as TaxYear, filingStatus)
  const federalStandardTotal = federalStandardDeduction + (federal?.nonItemizerCharitable ?? 0)
  const federalItemized = federal?.itemized.total ?? 0
  const federalDetails = federal?.itemized
  const effectiveSaltCap = federal?.saltCap ?? 0
  const federalUseItemized = federal?.useItemized ?? false

  const caStandardDeduction = california?.standardDeduction ??
    getCaliforniaStandardDeduction(taxYear as TaxYear, filingStatus)
  const californiaItemized = california?.itemized.total ?? 0
  const californiaDetails = california?.itemized
  const caUseItemized = california?.useItemized ?? false

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Deductions</h2>
      
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8">
            <p className="text-sm text-emerald-800">
              Enter your estimated <strong>full-year</strong> amounts below. We'll automatically determine whether standard or itemized deductions are better for you.
            </p>
          </div>
          
          {/* Business Expenses Section */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Business Expenses (Schedule C)</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you're self-employed or have business income, enter your total deductible business expenses here. 
              These reduce your income before applying standard or itemized deductions.
            </p>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Business Expenses (Full Year)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number" {...numberInputProps}
                  value={deductions.businessExpenses}
                  onChange={(e) => setDeductions({ businessExpenses: e.target.value })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Common deductible expenses: office supplies, business travel, home office, professional services, etc.
              </p>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-4">Itemized Deductions</h3>

          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Tax (Full Year)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number" {...numberInputProps}
                  value={deductions.propertyTax}
                  onChange={(e) => setDeductions({ propertyTax: e.target.value })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
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
                  type="number" {...numberInputProps}
                  value={deductions.mortgageInterest}
                  onChange={(e) => setDeductions({ mortgageInterest: e.target.value })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
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
                        type="number" {...numberInputProps}
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
                  type="number" {...numberInputProps}
                  value={deductions.donations}
                  onChange={(e) => setDeductions({ donations: e.target.value })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
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
                    type="number" {...numberInputProps}
                    value={deductions.otherStateIncomeTax}
                    onChange={(e) => setDeductions({ otherStateIncomeTax: e.target.value })}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
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
                  federalUseItemized
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm sm:text-base text-gray-900">Federal (IRS)</span>
                    {federalUseItemized ? (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">ITEMIZED</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">STANDARD</span>
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    ${fmt(federalUseItemized ? federalItemized : federalStandardTotal)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    Standard: ${fmt(federalStandardDeduction)}
                    {(federal?.nonItemizerCharitable ?? 0) > 0 && (
                      <span> + ${fmt(federal!.nonItemizerCharitable)} non-itemizer charitable deduction</span>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedFederal(!expandedFederal)}
                    className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>{expandedFederal ? 'Hide' : 'Show'} itemized breakdown</span>
                    <svg className={`w-3 h-3 transition-transform ${expandedFederal ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedFederal && federalDetails && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Property Tax:</span>
                        <span>${fmt(federalDetails.propertyTax)}</span>
                      </div>
                      {includeCaliforniaTax && (
                        <div className="flex justify-between">
                          <span>CA State Tax Paid in {taxYear}:</span>
                          <span>${fmt(federalDetails.stateIncomeTax)}</span>
                        </div>
                      )}
                      {includeCaliforniaTax && (
                        <div className="text-gray-500 pl-3">
                          Withholdings + Q1/Q2 estimated payments (the Q4 payment is due next January, so it counts next year)
                        </div>
                      )}
                      {!includeCaliforniaTax && federalDetails.stateIncomeTax > 0 && (
                        <div className="flex justify-between">
                          <span>State Income Tax:</span>
                          <span>${fmt(federalDetails.stateIncomeTax)}</span>
                        </div>
                      )}
                      {federalDetails.saltCapped && (
                        <div className="flex justify-between text-orange-600 font-medium">
                          <span>SALT Cap Applied:</span>
                          <span>${fmt(federalDetails.saltDeduction)} (max ${fmt(effectiveSaltCap)})</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1">
                        <span>Mortgage Interest:</span>
                        <span>${fmt(federalDetails.mortgageInterest)}</span>
                      </div>
                      {federalDetails.mortgageLimited && (
                        <div className="flex justify-between text-orange-600 text-xs pl-3">
                          <span>→ Limited to ${fmt(federalDetails.mortgageLimit)} loan:</span>
                          <span>${fmt(federalDetails.effectiveMortgageInterest)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Donations:</span>
                        <span>${fmt(federalDetails.donations)}</span>
                      </div>
                      {federalDetails.charitableFloor > 0 && (
                        <div className="flex justify-between text-orange-600 text-xs pl-3">
                          <span>→ Less 0.5% of AGI floor:</span>
                          <span>-${fmt(federalDetails.charitableFloor)}</span>
                        </div>
                      )}
                      {federalDetails.limitationReduction > 0 && (
                        <div className="flex justify-between text-orange-600 font-medium">
                          <span>37% bracket limitation (2/37):</span>
                          <span>-${fmt(federalDetails.limitationReduction)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium pt-1 border-t">
                        <span>Total Federal Itemized:</span>
                        <span className={!federalUseItemized ? 'text-gray-500' : ''}>
                          ${fmt(federalDetails.total)}
                        </span>
                      </div>
                      {!federalUseItemized && (
                        <div className="text-xs text-gray-500 mt-1">
                          Itemized (${fmt(federalDetails.total)}) is less than standard (${fmt(federalStandardTotal)})
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {includeCaliforniaTax && (
                  <div className={`rounded-lg p-3 sm:p-4 border-2 transition-all ${
                    caUseItemized
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm sm:text-base text-gray-900">California (FTB)</span>
                      {caUseItemized ? (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">ITEMIZED</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">STANDARD</span>
                      )}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      ${fmt(Math.max(californiaItemized, caStandardDeduction))}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      Standard: ${fmt(caStandardDeduction)}
                    </div>
                    <button
                      onClick={() => setExpandedCalifornia(!expandedCalifornia)}
                      className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>{expandedCalifornia ? 'Hide' : 'Show'} itemized breakdown</span>
                      <svg className={`w-3 h-3 transition-transform ${expandedCalifornia ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedCalifornia && californiaDetails && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Property Tax:</span>
                          <span>${fmt(californiaDetails.propertyTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mortgage Interest:</span>
                          <span>${fmt(californiaDetails.mortgageInterest)}</span>
                        </div>
                        {californiaDetails.mortgageLimited && (
                          <div className="flex justify-between text-orange-600 text-xs pl-3">
                            <span>→ Limited to $1M loan:</span>
                            <span>${fmt(californiaDetails.effectiveMortgageInterest)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Donations:</span>
                          <span>${fmt(californiaDetails.donations)}</span>
                        </div>
                        {californiaDetails.limitationReduction > 0 && (
                          <div className="flex justify-between text-orange-600 font-medium">
                            <span>High-income limitation (6% of AGI over threshold):</span>
                            <span>-${fmt(californiaDetails.limitationReduction)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium pt-1 border-t">
                          <span>Total CA Itemized:</span>
                          <span className={!caUseItemized ? 'text-gray-500' : ''}>
                            ${fmt(californiaDetails.total)}
                          </span>
                        </div>
                        {!caUseItemized && (
                          <div className="text-xs text-gray-500 mt-1">
                            Itemized (${fmt(californiaDetails.total)}) is less than standard (${fmt(caStandardDeduction)})
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
          className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Next
        </button>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { 
  calculateFederalEstimatedPayments,
  calculateCaliforniaEstimatedPayments,
  TaxCalculationResult
} from '../../calculators/orchestrator'
import { calculateFutureIncome } from '../../calculators/utils/income'
import '../../styles/print.css'

interface SummaryProps {
  onPrevious: () => void
  taxResults: TaxCalculationResult | null
}

export function Summary({ onPrevious, taxResults }: SummaryProps) {
  const { 
    taxYear,
    filingStatus,
    includeCaliforniaTax,
    userIncome,
    spouseIncome,
    estimatedPayments
  } = useStore()
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    ordinaryIncomeTax: false,
    capitalGainsTax: false,
    caBaseTax: false,
    mentalHealthTax: false,
    paymentSchedule: false
  })
  
  // State for payment schedule info toggle
  const [showScheduleInfo, setShowScheduleInfo] = useState(false)
  
  // Automatically expand all sections when printing
  useEffect(() => {
    const beforePrint = () => {
      setExpandedSections({
        ordinaryIncomeTax: true,
        capitalGainsTax: true,
        caBaseTax: true,
        mentalHealthTax: true,
        paymentSchedule: true
      })
      setShowScheduleInfo(true)
    }
    
    const afterPrint = () => {
      setExpandedSections({
        ordinaryIncomeTax: false,
        capitalGainsTax: false,
        caBaseTax: false,
        mentalHealthTax: false,
        paymentSchedule: false
      })
      setShowScheduleInfo(false)
    }
    
    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)
    
    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    }
  }, [])
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  
  // Calculate taxable income (totalIncome - deductions)
  const taxableIncome = taxResults ? taxResults.federalTax.taxableIncome : 0

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

  const federalOwed = taxResults.federalTax.owedOrRefund
  const caOwed = taxResults.californiaTax?.owedOrRefund || 0
  
  // Calculate withholdings separately for display
  const userFutureIncome = calculateFutureIncome(userIncome)
  const spouseFutureIncome = filingStatus === 'marriedFilingJointly' ? calculateFutureIncome(spouseIncome) : { totalFederalWithhold: 0, totalStateWithhold: 0 }
  
  const federalWithholdings = Math.round(
    (parseFloat(userIncome.ytdFederalWithhold) || 0) +
    (parseFloat(spouseIncome.ytdFederalWithhold) || 0) +
    userFutureIncome.totalFederalWithhold +
    spouseFutureIncome.totalFederalWithhold
  )
  
  const userStateWithholdings = (parseFloat(userIncome.ytdStateWithhold) || 0) + userFutureIncome.totalStateWithhold
  const spouseStateWithholdings = (parseFloat(spouseIncome.ytdStateWithhold) || 0) + spouseFutureIncome.totalStateWithhold
  
  const californiaWithholdings = includeCaliforniaTax 
    ? Math.round(userStateWithholdings + (filingStatus === 'marriedFilingJointly' ? spouseStateWithholdings : 0))
    : 0
    
  // Calculate total estimated payments already made
  const federalEstimatedPaid = 
    (parseFloat(estimatedPayments.federalQ1) || 0) +
    (parseFloat(estimatedPayments.federalQ2) || 0) +
    (parseFloat(estimatedPayments.federalQ3) || 0) +
    (parseFloat(estimatedPayments.federalQ4) || 0)
  
  const californiaEstimatedPaid = 
    (parseFloat(estimatedPayments.californiaQ1) || 0) +
    (parseFloat(estimatedPayments.californiaQ2) || 0) +
    (parseFloat(estimatedPayments.californiaQ4) || 0)
  
  // Calculate suggested estimated payments
  // Pass the total that needs to be paid via estimated payments (owed + already paid)
  const federalSuggestions = calculateFederalEstimatedPayments(
    federalOwed + federalEstimatedPaid, 
    estimatedPayments
  )
  const californiaSuggestions = includeCaliforniaTax
    ? calculateCaliforniaEstimatedPayments(
        caOwed + californiaEstimatedPaid,
        estimatedPayments
      )
    : []
    
  // Check if all payments have been made
  const allFederalPaid = federalSuggestions.every(s => s.isPaid)
  const allCaliforniaPaid = californiaSuggestions.every(s => s.isPaid)

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 print:text-center screen-only">Summary & Actionable Insights</h2>
      
      {/* Print-only header focused on estimated payments */}
      <div className="print-only print-header">
        <h2 className="text-xl font-bold text-center mb-4">Estimated Tax Payment Schedule</h2>
        <div className="flex justify-between text-sm mb-4">
          <div>
            <strong>Tax Year:</strong> {taxYear}
          </div>
          <div>
            <strong>Filing Status:</strong> {filingStatus === 'single' ? 'Single' : 'Married Filing Jointly'}
          </div>
          <div>
            <strong>Report Date:</strong> {new Date().toLocaleDateString()}
          </div>
        </div>
        <div className="text-center mb-4">
          <div className="flex justify-center gap-8">
            <div>
              <strong>Federal Tax Owed:</strong> 
              <span className={`ml-2 font-bold ${federalOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${Math.abs(federalOwed).toLocaleString()} {federalOwed > 0 ? 'Owed' : 'Overpaid'}
              </span>
            </div>
            {includeCaliforniaTax && (
              <div>
                <strong>CA Tax Owed:</strong> 
                <span className={`ml-2 font-bold ${caOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${Math.abs(caOwed).toLocaleString()} {caOwed > 0 ? 'Owed' : 'Overpaid'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tax Owed/Overpaid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 tax-owed-display">
        <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${
          federalOwed > 0 ? 'border-red-200' : 'border-green-200'
        }`}>
          <div className="flex items-center mb-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mr-2">FEDERAL</span>
            <h3 className="text-lg font-medium">Federal Tax (IRS)</h3>
          </div>
          <p className="text-3xl font-bold mb-1">
            {federalOwed > 0 ? (
              <span className="text-red-600">${federalOwed.toLocaleString()} Owed</span>
            ) : (
              <span className="text-green-600">${Math.abs(federalOwed).toLocaleString()} Overpaid</span>
            )}
          </p>
          <p className="text-sm text-gray-600">Estimated for tax year {taxYear}</p>
        </div>

        {includeCaliforniaTax && (
          <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${
            caOwed > 0 ? 'border-red-200' : 'border-green-200'
          }`}>
            <div className="flex items-center mb-2">
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded mr-2">CA</span>
              <h3 className="text-lg font-medium">California Tax (FTB)</h3>
            </div>
            <p className="text-3xl font-bold mb-1">
              {caOwed > 0 ? (
                <span className="text-red-600">${caOwed.toLocaleString()} Owed</span>
              ) : (
                <span className="text-green-600">${Math.abs(caOwed).toLocaleString()} Overpaid</span>
              )}
            </p>
            <p className="text-sm text-gray-600">Estimated for tax year {taxYear}</p>
          </div>
        )}
      </div>

      {/* Tax Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 tax-breakdown-section">
        <h3 className="text-lg font-medium mb-4">Tax Calculation Breakdown</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span>Total Income</span>
            <span className="font-medium">${taxResults.totalIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 pb-2">
            <span>Combined Effective Tax Rate</span>
            <span>
              {((
                (taxResults.federalTax.totalTax + (taxResults.californiaTax?.totalTax || 0)) / 
                taxResults.totalIncome * 100
              ).toFixed(2))}%
            </span>
          </div>
        </div>

        {/* Federal Tax Details */}
        <div className="mt-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h4 className="font-medium mb-3 flex items-center">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mr-2">FEDERAL</span>
            Federal Tax Details (IRS)
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tax Liability (before withholdings)</span>
              <span className="font-medium">${taxResults.federalTax.totalTax.toLocaleString()}</span>
            </div>
            <div className="pl-4 space-y-1 text-gray-600">
              {/* Ordinary Income Tax */}
              <div>
                <button
                  onClick={() => toggleSection('ordinaryIncomeTax')}
                  className="flex items-center justify-between w-full text-left hover:text-gray-900"
                >
                  <span>• Ordinary Income Tax: ${taxResults.federalTax.ordinaryIncomeTax.toLocaleString()}</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform print:hidden ${expandedSections.ordinaryIncomeTax ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSections.ordinaryIncomeTax && (
                  <div className="mt-2 ml-4 p-3 bg-gray-50 rounded-md">
                    <h5 className="font-medium text-sm mb-2">Ordinary Income Tax Calculation</h5>
                    <div className="space-y-2 text-xs">
                      {(() => {
                        const incomeComponents = taxResults.federalTax.incomeComponents
                        
                        // Calculate YTD and future wages for display breakdown
                        const userYtdWage = parseFloat(userIncome.ytdWage) || 0
                        const spouseYtdWage = parseFloat(spouseIncome.ytdWage) || 0
                        const userFutureIncome = calculateFutureIncome(userIncome)
                        const spouseFutureIncome = calculateFutureIncome(spouseIncome)
                        
                        return (
                          <>
                            <div className="mb-3 p-2 bg-white rounded border border-gray-200">
                              <div className="font-medium text-gray-700 mb-1">Ordinary Income Components:</div>
                              <div className="space-y-1 text-gray-600">
                                <div className="flex justify-between">
                                  <span>Wages (YTD + Future)</span>
                                  <span>${incomeComponents.wages.toLocaleString()}</span>
                                </div>
                                {(userYtdWage > 0 || spouseYtdWage > 0) && (
                                  <div className="pl-4 text-gray-500">
                                    <div className="flex justify-between">
                                      <span>- YTD wages</span>
                                      <span>${(userYtdWage + spouseYtdWage).toLocaleString()}</span>
                                    </div>
                                  </div>
                                )}
                                {(userFutureIncome.totalWage > 0 || spouseFutureIncome.totalWage > 0) && (
                                  <div className="pl-4 text-gray-500">
                                    <div className="flex justify-between">
                                      <span>- Future income</span>
                                      <span>${(userFutureIncome.totalWage + spouseFutureIncome.totalWage).toLocaleString()}</span>
                                    </div>
                                  </div>
                                )}
                                {incomeComponents.nonQualifiedDividends > 0 && (
                                  <div className="flex justify-between">
                                    <span>Non-qualified dividends</span>
                                    <span>${incomeComponents.nonQualifiedDividends.toLocaleString()}</span>
                                  </div>
                                )}
                                {incomeComponents.interestIncome > 0 && (
                                  <div className="flex justify-between">
                                    <span>Interest income</span>
                                    <span>${incomeComponents.interestIncome.toLocaleString()}</span>
                                  </div>
                                )}
                                {incomeComponents.shortTermGains > 0 && (
                                  <div className="flex justify-between">
                                    <span>Short-term capital gains</span>
                                    <span>${incomeComponents.shortTermGains.toLocaleString()}</span>
                                  </div>
                                )}
                                {incomeComponents.capitalLossDeduction < 0 && (
                                  <div className="flex justify-between">
                                    <span>Capital loss deduction (limited)</span>
                                    <span className="text-red-600">${incomeComponents.capitalLossDeduction.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium pt-1 border-t">
                                  <span>Total ordinary income</span>
                                  <span>${incomeComponents.totalOrdinaryIncome.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Less: {taxResults.federalTax.deduction.type === 'standard' ? 'Standard' : 'Itemized'} deduction</span>
                                  <span>-${taxResults.federalTax.deduction.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Ordinary taxable income</span>
                                  <span>${incomeComponents.ordinaryTaxableIncome.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="font-medium text-gray-700 mb-1">Tax Bracket Breakdown:</div>
                            {taxResults.federalTax.ordinaryTaxBrackets.map((bracketDetail, index) => {
                              const bracket = bracketDetail.bracket
                              
                              return (
                                <div key={index} className="space-y-1 mb-2">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                    <span className="text-gray-700">
                                      ${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()} 
                                      <span className="text-gray-500 ml-1">({(bracket.rate * 100).toFixed(0)}%)</span>
                                    </span>
                                    <span className="text-sm sm:text-right pl-4 sm:pl-0">
                                      ${bracketDetail.taxableInBracket.toLocaleString()} × {(bracket.rate * 100).toFixed(0)}% = 
                                      <span className="font-medium ml-1">${bracketDetail.taxForBracket.toLocaleString()}</span>
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Long-Term Capital Gains Tax */}
              <div>
                <button
                  onClick={() => toggleSection('capitalGainsTax')}
                  className="flex items-center justify-between w-full text-left hover:text-gray-900"
                >
                  <span>• Long-Term Capital Gains Tax: ${taxResults.federalTax.capitalGainsTax.toLocaleString()}</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform print:hidden ${expandedSections.capitalGainsTax ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSections.capitalGainsTax && (
                  <div className="mt-2 ml-4 p-3 bg-gray-50 rounded-md">
                    <h5 className="font-medium text-sm mb-2">Capital Gains Tax Calculation</h5>
                    <div className="space-y-2 text-xs">
                      {(() => {
                        const incomeComponents = taxResults.federalTax.incomeComponents
                        const capitalGainsBrackets = taxResults.federalTax.capitalGainsBrackets
                        
                        // Only positive LTCG gets preferential rates
                        const ltcgForPreferentialRate = Math.max(0, incomeComponents.longTermGains)
                        const totalPreferentialIncome = ltcgForPreferentialRate + incomeComponents.qualifiedDividends
                        
                        if (totalPreferentialIncome <= 0) {
                          return <div className="text-gray-500">No income eligible for preferential capital gains rates</div>
                        }
                        
                        return (
                          <>
                            <div className="mb-2 text-gray-600">
                              {incomeComponents.longTermGains < 0 ? (
                                <>
                                  Long-term capital losses: ${Math.abs(incomeComponents.longTermGains).toLocaleString()} (limited to $3,000 deduction)<br/>
                                  Qualified dividends: ${incomeComponents.qualifiedDividends.toLocaleString()}<br/>
                                  <span className="font-medium">Income at preferential rates: ${totalPreferentialIncome.toLocaleString()}</span>
                                </>
                              ) : (
                                <>
                                  Long-term capital gains: ${incomeComponents.longTermGains.toLocaleString()}<br/>
                                  Qualified dividends: ${incomeComponents.qualifiedDividends.toLocaleString()}<br/>
                                  <span className="font-medium">Total at preferential rates: ${totalPreferentialIncome.toLocaleString()}</span>
                                </>
                              )}
                            </div>
                            
                            {capitalGainsBrackets.length > 0 ? (
                              <>
                                <div className="font-medium text-gray-700 mb-1">Capital Gains Tax Bracket Breakdown:</div>
                                {capitalGainsBrackets.map((bracketDetail, index) => {
                                  const bracket = bracketDetail.bracket
                                  
                                  return (
                                    <div key={index} className="space-y-1 mb-2">
                                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                        <span className="text-gray-700">
                                          ${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()} 
                                          <span className="text-gray-500 ml-1">({(bracket.rate * 100).toFixed(0)}%)</span>
                                        </span>
                                        <span className="text-sm sm:text-right pl-4 sm:pl-0">
                                          ${bracketDetail.taxableInBracket.toLocaleString()} × {(bracket.rate * 100).toFixed(0)}% = 
                                          <span className="font-medium ml-1">${bracketDetail.taxForBracket.toLocaleString()}</span>
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </>
                            ) : (
                              <div className="text-gray-600">
                                No capital gains tax applies
                              </div>
                            )}
                            
                            <div className="p-2 bg-gray-100 rounded mt-2">
                              <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span>Your total taxable income:</span>
                                  <span className="font-medium">${taxableIncome.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Income at preferential rates:</span>
                                  <span className="font-medium">${totalPreferentialIncome.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-gray-300">
                                  <span>Tax on capital gains/qualified dividends:</span>
                                  <span className="font-medium">${taxResults.federalTax.capitalGainsTax.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <span>Total Withholdings</span>
              <span className="font-medium">-${federalWithholdings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Payments Made</span>
              <span className="font-medium">-${(
                (parseFloat(estimatedPayments.federalQ1) || 0) +
                (parseFloat(estimatedPayments.federalQ2) || 0) +
                (parseFloat(estimatedPayments.federalQ3) || 0) +
                (parseFloat(estimatedPayments.federalQ4) || 0)
              ).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-medium">
              <span>Net Tax Owed/Overpaid</span>
              <span className={federalOwed > 0 ? 'text-red-600' : 'text-green-600'}>
                ${Math.abs(federalOwed).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Effective Tax Rate</span>
              <span>{taxResults.federalTax.effectiveRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* California Tax Details */}
        {includeCaliforniaTax && taxResults.californiaTax && (
          <div className="mt-6 p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
            <h4 className="font-medium mb-3 flex items-center">
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded mr-2">CALIFORNIA</span>
              California Tax Details (FTB)
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tax Liability (before withholdings)</span>
                <span className="font-medium">${taxResults.californiaTax.totalTax.toLocaleString()}</span>
              </div>
              <div className="pl-4 space-y-1 text-gray-600">
                {/* Base CA Tax */}
                <div>
                  <button
                    onClick={() => toggleSection('caBaseTax')}
                    className="flex items-center justify-between w-full text-left hover:text-gray-900"
                  >
                    <span>• Base CA Tax: ${taxResults.californiaTax.baseTax.toLocaleString()}</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform print:hidden ${expandedSections.caBaseTax ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.caBaseTax && (
                    <div className="mt-2 ml-4 p-3 bg-gray-50 rounded-md">
                      <h5 className="font-medium text-sm mb-2">California Tax Bracket Calculation</h5>
                      <div className="space-y-2 text-xs">
                        {(() => {
                          const caDeduction = taxResults.californiaTax!.deduction.amount
                          const caTaxableIncome = taxResults.californiaTax!.taxableIncome
                          
                          return (
                            <>
                              <div className="mb-3 p-2 bg-white rounded border border-gray-200">
                                <div className="font-medium text-gray-700 mb-1">California Taxable Income:</div>
                                <div className="space-y-1 text-gray-600">
                                  <div className="flex justify-between">
                                    <span>Total income</span>
                                    <span>${taxResults.totalIncome.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Less: {taxResults.californiaTax!.deduction.type === 'standard' ? 'Standard' : 'Itemized'} deduction</span>
                                    <span>-${caDeduction.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between font-medium pt-1 border-t">
                                    <span>California taxable income</span>
                                    <span>${caTaxableIncome.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="font-medium text-gray-700 mb-1">Tax Bracket Breakdown:</div>
                              {taxResults.californiaTax!.taxBrackets.map((bracketDetail, index) => {
                                const bracket = bracketDetail.bracket
                                
                                return (
                                  <div key={index} className="space-y-1 mb-2">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                      <span className="text-gray-700">
                                        ${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()} 
                                        <span className="text-gray-500 ml-1">({(bracket.rate * 100).toFixed(1)}%)</span>
                                      </span>
                                      <span className="text-sm sm:text-right pl-4 sm:pl-0">
                                        ${bracketDetail.taxableInBracket.toLocaleString()} × {(bracket.rate * 100).toFixed(1)}% = 
                                        <span className="font-medium ml-1">${bracketDetail.taxForBracket.toLocaleString()}</span>
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            </>
                          )
                        })()}
                      </div>
                      <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                        Note: California taxes all income types (including capital gains) at the same rates.
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Mental Health Tax */}
                {taxResults.californiaTax.mentalHealthTax > 0 && (
                  <div>
                    <button
                      onClick={() => toggleSection('mentalHealthTax')}
                      className="flex items-center justify-between w-full text-left hover:text-gray-900"
                    >
                      <span>• Mental Health Tax (1%): ${taxResults.californiaTax.mentalHealthTax.toLocaleString()}</span>
                      <svg
                        className={`w-4 h-4 transform transition-transform print:hidden ${expandedSections.mentalHealthTax ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.mentalHealthTax && (
                      <div className="mt-2 ml-4 p-3 bg-gray-50 rounded-md">
                        <h5 className="font-medium text-sm mb-2">Mental Health Tax Calculation</h5>
                        <div className="text-xs space-y-1">
                          <div>California taxable income: ${taxResults.californiaTax!.taxableIncome.toLocaleString()}</div>
                          <div>Mental health tax threshold: $1,000,000</div>
                          <div>Amount over threshold: ${Math.max(0, taxResults.californiaTax!.taxableIncome - 1000000).toLocaleString()}</div>
                          <div className="pt-1 border-t">
                            <span className="font-medium">Tax: 1% × ${Math.max(0, taxResults.californiaTax!.taxableIncome - 1000000).toLocaleString()} = ${taxResults.californiaTax!.mentalHealthTax.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Effective Tax Rate</span>
                <span>{taxResults.californiaTax.effectiveRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estimated Payments Status & Suggestions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Estimated Tax Payments</h3>
        
        {/* Federal Payments */}
        <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h4 className="font-medium mb-3 flex items-center">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mr-2">FEDERAL</span>
            Federal Estimated Payments (IRS)
          </h4>
          
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
                <div key={payment.quarter} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded-md ${
                  payment.isPaid ? 'bg-green-50 border border-green-200' : 
                  payment.isPastDue ? 'bg-gray-50 border border-gray-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1 sm:mb-0">
                    {payment.isPaid && (
                      <svg className="w-5 h-5 text-green-600 print:hidden flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                      <span className={`whitespace-nowrap ${payment.isPaid ? 'font-medium' : payment.isPastDue ? 'text-gray-500' : ''}`}>
                        {payment.quarter} - {payment.dueDate}
                      </span>
                      {payment.isPaid && <span className="text-sm text-green-600 whitespace-nowrap">(Paid)</span>}
                      {payment.isPastDue && <span className="text-sm text-gray-500 whitespace-nowrap">(Past Due)</span>}
                    </div>
                  </div>
                  <span className={`font-medium text-lg sm:text-base ${
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
          <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
            <h4 className="font-medium mb-3 flex items-center">
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded mr-2">CA</span>
              California Estimated Payments (FTB)
            </h4>
            
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
                    <div key={payment.quarter} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 rounded-md ${
                      payment.isPaid ? 'bg-green-50 border border-green-200' : 
                      payment.isPastDue ? 'bg-gray-50 border border-gray-200' :
                      'bg-emerald-50 border border-emerald-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1 sm:mb-0">
                        {payment.isPaid && (
                          <svg className="w-5 h-5 text-green-600 print:hidden flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                          <span className={`whitespace-nowrap ${payment.isPaid ? 'font-medium' : payment.isPastDue ? 'text-gray-500' : ''}`}>
                            {payment.quarter} - {payment.dueDate}
                          </span>
                          {payment.isPaid && <span className="text-sm text-green-600 whitespace-nowrap">(Paid)</span>}
                          {payment.isPastDue && <span className="text-sm text-gray-500 whitespace-nowrap">(Past Due)</span>}
                        </div>
                      </div>
                      <span className={`font-medium text-lg sm:text-base ${
                        payment.isPaid ? 'text-green-700' : 
                        payment.isPastDue ? 'text-gray-500' :
                        'text-emerald-700'
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
              </div>
            )}
          </div>
        )}
        
        {/* Payment Schedule Information */}
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={() => setShowScheduleInfo(!showScheduleInfo)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 print:hidden"
          >
            <span>{showScheduleInfo ? '▼' : '▶'}</span>
            How is the payment schedule calculated?
          </button>
          
          {showScheduleInfo && (
            <div className="mt-3 text-sm text-gray-600 space-y-2">
              <p>
                <strong>Federal:</strong> The IRS expects quarterly payments of 25% each.
                If you miss a quarter, the next payment should catch up to the cumulative percentage:
                Q1=25%, Q2=50%, Q3=75%, Q4=100% of total annual tax.
              </p>
              {includeCaliforniaTax && (
                <p>
                  <strong>California:</strong> The FTB has a different schedule:
                  Q1=30%, Q2=70%, Q4=100% cumulative (no Q3 payment).
                </p>
              )}
            </div>
          )}
          
          {/* Always show payment schedule info when printing */}
          <div className="print-only mt-3 text-sm text-gray-600 space-y-2">
            <p>
              <strong>Federal:</strong> The IRS expects quarterly payments of 25% each.
              If you miss a quarter, the next payment should catch up to the cumulative percentage:
              Q1=25%, Q2=50%, Q3=75%, Q4=100% of total annual tax.
            </p>
            {includeCaliforniaTax && (
              <p>
                <strong>California:</strong> The FTB has a different schedule:
                Q1=30%, Q2=70%, Q4=100% cumulative (no Q3 payment).
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 print:hidden"
        >
          Previous
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 print:hidden"
        >
          Print Payment Schedule
        </button>
      </div>
    </div>
  )
}
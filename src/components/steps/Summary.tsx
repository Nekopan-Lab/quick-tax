import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { 
  calculateComprehensiveTax, 
  calculateCaliforniaWithholdings,
  calculateFederalEstimatedPayments,
  calculateCaliforniaEstimatedPayments,
  calculateCaliforniaItemizedDeductions,
  calculateFutureIncome
} from '../../utils/taxCalculations'
import { TaxYear } from '../../types'
import { getFederalTaxBrackets, getFederalCapitalGainsBrackets } from '../../calculators/federal/constants'
import { getCaliforniaTaxBrackets } from '../../calculators/california/constants'
import { getCaliforniaStandardDeduction } from '../../calculators/california/calculator'

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
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    ordinaryIncomeTax: false,
    capitalGainsTax: false,
    caBaseTax: false,
    mentalHealthTax: false
  })
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

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
  
  // Calculate withholdings separately for display
  const userFutureIncome = calculateFutureIncome(userIncome)
  const spouseFutureIncome = filingStatus === 'marriedFilingJointly' ? calculateFutureIncome(spouseIncome) : { totalFederalWithhold: 0, totalStateWithhold: 0 }
  
  const federalWithholdings = Math.round(
    (parseFloat(userIncome.ytdFederalWithhold) || 0) +
    (parseFloat(spouseIncome.ytdFederalWithhold) || 0) +
    userFutureIncome.totalFederalWithhold +
    spouseFutureIncome.totalFederalWithhold
  )
  
  const californiaWithholdings = includeCaliforniaTax 
    ? calculateCaliforniaWithholdings(userIncome, spouseIncome, filingStatus)
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
              {/* Ordinary Income Tax */}
              <div>
                <button
                  onClick={() => toggleSection('ordinaryIncomeTax')}
                  className="flex items-center justify-between w-full text-left hover:text-gray-900"
                >
                  <span>• Ordinary Income Tax: ${taxResults.federalTax.ordinaryIncomeTax.toLocaleString()}</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${expandedSections.ordinaryIncomeTax ? 'rotate-180' : ''}`}
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
                        const brackets = getFederalTaxBrackets(taxYear as TaxYear, filingStatus!)
                        
                        // Calculate wages using the same logic as the main calculation
                        const userYtdWage = parseFloat(userIncome.ytdWage) || 0
                        const spouseYtdWage = parseFloat(spouseIncome.ytdWage) || 0
                        const userFutureIncome = calculateFutureIncome(userIncome)
                        const spouseFutureIncome = calculateFutureIncome(spouseIncome)
                        const userTotalWage = userYtdWage + userFutureIncome.totalWage
                        const spouseTotalWage = spouseYtdWage + spouseFutureIncome.totalWage
                        const wages = userTotalWage + spouseTotalWage
                        
                        const ordinaryDividends = (parseFloat(userIncome.ordinaryDividends) || 0) + (parseFloat(spouseIncome.ordinaryDividends) || 0)
                        const qualifiedDividends = (parseFloat(userIncome.qualifiedDividends) || 0) + (parseFloat(spouseIncome.qualifiedDividends) || 0)
                        const nonQualifiedDividends = Math.max(0, ordinaryDividends - qualifiedDividends)
                        const interestIncome = (parseFloat(userIncome.interestIncome) || 0) + (parseFloat(spouseIncome.interestIncome) || 0)
                        const shortTermGains = (parseFloat(userIncome.shortTermGains) || 0) + (parseFloat(spouseIncome.shortTermGains) || 0)
                        const longTermGains = (parseFloat(userIncome.longTermGains) || 0) + (parseFloat(spouseIncome.longTermGains) || 0)
                        const netCapitalGains = shortTermGains + longTermGains
                        const capitalLossDeduction = netCapitalGains < 0 ? Math.max(netCapitalGains, -3000) : 0
                        
                        const totalOrdinaryIncome = wages + nonQualifiedDividends + interestIncome + 
                          Math.max(0, shortTermGains) + capitalLossDeduction
                        const ordinaryTaxableIncome = Math.max(0, totalOrdinaryIncome - taxResults.deductionAmount)
                        
                        let remainingIncome = ordinaryTaxableIncome
                        let cumulativeTax = 0
                        
                        return (
                          <>
                            <div className="mb-3 p-2 bg-white rounded border border-gray-200">
                              <div className="font-medium text-gray-700 mb-1">Ordinary Income Components:</div>
                              <div className="space-y-1 text-gray-600">
                                <div className="flex justify-between">
                                  <span>Wages (YTD + Future)</span>
                                  <span>${wages.toLocaleString()}</span>
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
                                {nonQualifiedDividends > 0 && (
                                  <div className="flex justify-between">
                                    <span>Non-qualified dividends</span>
                                    <span>${nonQualifiedDividends.toLocaleString()}</span>
                                  </div>
                                )}
                                {interestIncome > 0 && (
                                  <div className="flex justify-between">
                                    <span>Interest income</span>
                                    <span>${interestIncome.toLocaleString()}</span>
                                  </div>
                                )}
                                {shortTermGains > 0 && (
                                  <div className="flex justify-between">
                                    <span>Short-term capital gains</span>
                                    <span>${shortTermGains.toLocaleString()}</span>
                                  </div>
                                )}
                                {capitalLossDeduction < 0 && (
                                  <div className="flex justify-between">
                                    <span>Capital loss deduction (limited)</span>
                                    <span className="text-red-600">${capitalLossDeduction.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium pt-1 border-t">
                                  <span>Total ordinary income</span>
                                  <span>${totalOrdinaryIncome.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Less: {taxResults.deductionType === 'standard' ? 'Standard' : 'Itemized'} deduction</span>
                                  <span>-${taxResults.deductionAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Ordinary taxable income</span>
                                  <span>${ordinaryTaxableIncome.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="font-medium text-gray-700 mb-1">Tax Bracket Breakdown:</div>
                            {brackets.map((bracket, index) => {
                              const taxableInBracket = Math.min(Math.max(0, remainingIncome), bracket.max - bracket.min)
                              const taxForBracket = taxableInBracket * bracket.rate
                              cumulativeTax += taxForBracket
                              remainingIncome -= taxableInBracket
                              
                              if (taxableInBracket === 0) return null
                              
                              return (
                                <div key={index} className="flex justify-between items-center">
                                  <span>
                                    ${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()} 
                                    <span className="text-gray-500 ml-1">({(bracket.rate * 100).toFixed(0)}%)</span>
                                  </span>
                                  <span className="text-right">
                                    ${taxableInBracket.toLocaleString()} × {(bracket.rate * 100).toFixed(0)}% = 
                                    <span className="font-medium ml-1">${Math.round(taxForBracket).toLocaleString()}</span>
                                  </span>
                                </div>
                              )
                            }).filter(Boolean)}
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
                    className={`w-4 h-4 transform transition-transform ${expandedSections.capitalGainsTax ? 'rotate-180' : ''}`}
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
                        const brackets = getFederalCapitalGainsBrackets(taxYear as TaxYear, filingStatus!)
                        const ltcg = (parseFloat(userIncome.longTermGains) || 0) + (parseFloat(spouseIncome.longTermGains) || 0)
                        const qualDiv = (parseFloat(userIncome.qualifiedDividends) || 0) + (parseFloat(spouseIncome.qualifiedDividends) || 0)
                        
                        // Only positive LTCG gets preferential rates
                        const ltcgForPreferentialRate = Math.max(0, ltcg)
                        const totalPreferentialIncome = ltcgForPreferentialRate + qualDiv
                        
                        if (totalPreferentialIncome <= 0) {
                          return <div className="text-gray-500">No income eligible for preferential capital gains rates</div>
                        }
                        
                        return (
                          <>
                            <div className="mb-2 text-gray-600">
                              {ltcg < 0 ? (
                                <>
                                  Long-term capital losses: ${Math.abs(ltcg).toLocaleString()} (limited to $3,000 deduction)<br/>
                                  Qualified dividends: ${qualDiv.toLocaleString()}<br/>
                                  <span className="font-medium">Income at preferential rates: ${totalPreferentialIncome.toLocaleString()}</span>
                                </>
                              ) : (
                                <>
                                  Long-term capital gains: ${ltcg.toLocaleString()}<br/>
                                  Qualified dividends: ${qualDiv.toLocaleString()}<br/>
                                  <span className="font-medium">Total at preferential rates: ${totalPreferentialIncome.toLocaleString()}</span>
                                </>
                              )}
                            </div>
                            <div className="mb-3 p-2 bg-white rounded border border-gray-200">
                              <div className="font-medium text-gray-700 mb-2">How Capital Gains Tax Rates Work:</div>
                              <div className="space-y-2 text-gray-600">
                                <div className="text-xs leading-relaxed">
                                  Your capital gains tax rate depends on your total taxable income (ordinary income + capital gains).
                                  The income shown in the brackets includes both types of income.
                                </div>
                                <div className="space-y-1">
                                  {brackets.map((bracket, index) => {
                                    const rate = bracket.rate * 100
                                    const isYourBracket = taxResults.taxableIncome >= bracket.min && taxResults.taxableIncome <= bracket.max
                                    
                                    return (
                                      <div key={index} className={`flex justify-between items-center p-1.5 rounded ${isYourBracket ? 'bg-gray-100 font-medium' : ''}`}>
                                        <span className="flex items-center">
                                          <span className="w-12 text-right mr-2">{rate}%</span>
                                          <span className="text-gray-500">on income from ${bracket.min.toLocaleString()} to ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}</span>
                                        </span>
                                        {isYourBracket && (
                                          <span className="text-sm">← Your bracket</span>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="p-2 bg-gray-100 rounded">
                              <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span>Your total taxable income:</span>
                                  <span className="font-medium">${taxResults.taxableIncome.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Income at preferential rates:</span>
                                  <span className="font-medium">${totalPreferentialIncome.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Your capital gains tax rate:</span>
                                  <span className="font-medium">{
                                    taxResults.taxableIncome <= brackets[0].max ? '0%' :
                                    taxResults.taxableIncome <= brackets[1].max ? '15%' : '20%'
                                  }</span>
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
          </div>
        </div>

        {/* California Tax Details */}
        {includeCaliforniaTax && taxResults.californiaTax && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3">California Tax Details</h4>
            {/* California Deduction Details */}
            {taxResults.deductionType === 'itemized' && (
              <div className="mb-4 text-sm">
                <div className="font-medium mb-2">California Itemized Deductions:</div>
                <div className="pl-4 text-gray-600 space-y-1">
                  {(() => {
                    const californiaItemized = calculateCaliforniaItemizedDeductions(deductions)
                    const propertyTax = parseFloat(deductions.propertyTax) || 0
                    const mortgageInterest = parseFloat(deductions.mortgageInterest) || 0
                    const donations = parseFloat(deductions.donations) || 0
                    const mortgageBalance = parseFloat(deductions.mortgageBalance) || 0
                    const mortgageLimit = 1000000
                    
                    return (
                      <>
                        <div>• Property Tax: ${propertyTax.toLocaleString()}</div>
                        <div>• Mortgage Interest: ${mortgageInterest.toLocaleString()}</div>
                        {mortgageBalance > mortgageLimit && (
                          <div className="text-amber-600">• (Limited to interest on $1,000,000 loan)</div>
                        )}
                        <div>• Donations: ${donations.toLocaleString()}</div>
                        <div className="font-medium pt-1 border-t">Total CA Itemized: ${californiaItemized.toLocaleString()}</div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
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
                      className={`w-4 h-4 transform transition-transform ${expandedSections.caBaseTax ? 'rotate-180' : ''}`}
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
                          const brackets = getCaliforniaTaxBrackets(taxYear as TaxYear, filingStatus!)
                          const caDeduction = taxResults.deductionType === 'standard' ? 
                            getCaliforniaStandardDeduction(taxYear as TaxYear, filingStatus!) :
                            calculateCaliforniaItemizedDeductions(deductions)
                          const caTaxableIncome = Math.max(0, taxResults.totalIncome - caDeduction)
                          let remainingIncome = caTaxableIncome
                          let cumulativeTax = 0
                          
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
                                    <span>Less: {taxResults.deductionType === 'standard' ? 'Standard' : 'Itemized'} deduction</span>
                                    <span>-${caDeduction.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between font-medium pt-1 border-t">
                                    <span>California taxable income</span>
                                    <span>${caTaxableIncome.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="font-medium text-gray-700 mb-1">Tax Bracket Breakdown:</div>
                              {brackets.map((bracket, index) => {
                                const taxableInBracket = Math.min(Math.max(0, remainingIncome), bracket.max - bracket.min)
                                const taxForBracket = taxableInBracket * bracket.rate
                                cumulativeTax += taxForBracket
                                remainingIncome -= taxableInBracket
                                
                                if (taxableInBracket === 0) return null
                                
                                return (
                                  <div key={index} className="flex justify-between items-center">
                                    <span>
                                      ${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()} 
                                      <span className="text-gray-500 ml-1">({(bracket.rate * 100).toFixed(1)}%)</span>
                                    </span>
                                    <span className="text-right">
                                      ${taxableInBracket.toLocaleString()} × {(bracket.rate * 100).toFixed(1)}% = 
                                      <span className="font-medium ml-1">${Math.round(taxForBracket).toLocaleString()}</span>
                                    </span>
                                  </div>
                                )
                              }).filter(Boolean)}
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
                        className={`w-4 h-4 transform transition-transform ${expandedSections.mentalHealthTax ? 'rotate-180' : ''}`}
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
                          <div>California taxable income: ${(() => {
                            const caDeduction = taxResults.deductionType === 'standard' ? 
                              getCaliforniaStandardDeduction(taxYear as TaxYear, filingStatus!) :
                              calculateCaliforniaItemizedDeductions(deductions)
                            return Math.max(0, taxResults.totalIncome - caDeduction).toLocaleString()
                          })()}</div>
                          <div>Mental health tax threshold: $1,000,000</div>
                          <div>Amount over threshold: ${(() => {
                            const caDeduction = taxResults.deductionType === 'standard' ? 
                              getCaliforniaStandardDeduction(taxYear as TaxYear, filingStatus!) :
                              calculateCaliforniaItemizedDeductions(deductions)
                            const caTaxableIncome = Math.max(0, taxResults.totalIncome - caDeduction)
                            return Math.max(0, caTaxableIncome - 1000000).toLocaleString()
                          })()}</div>
                          <div className="pt-1 border-t">
                            <span className="font-medium">Tax: 1% × ${(() => {
                              const caDeduction = taxResults.deductionType === 'standard' ? 
                                getCaliforniaStandardDeduction(taxYear as TaxYear, filingStatus!) :
                                calculateCaliforniaItemizedDeductions(deductions)
                              const caTaxableIncome = Math.max(0, taxResults.totalIncome - caDeduction)
                              return Math.max(0, caTaxableIncome - 1000000).toLocaleString()
                            })()} = ${taxResults.californiaTax.mentalHealthTax.toLocaleString()}</span>
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
            </div>
          </div>
        )}
      </div>

      {/* Estimated Payments Status & Suggestions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Estimated Tax Payments</h3>
        
        {/* Payment Schedule Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-sm">
          <h4 className="font-medium text-blue-900 mb-2">Understanding Estimated Tax Payment Schedules</h4>
          <div className="space-y-2 text-blue-800">
            <p>
              <span className="font-medium">Federal (IRS):</span> Requires cumulative payments throughout the year:
              <span className="block ml-4 mt-1">• Q1 (Apr 15): 25% of annual tax • Q2 (Jun 16): 50% of annual tax • Q3 (Sep 15): 75% of annual tax • Q4 (Jan 15): 100% of annual tax</span>
            </p>
            <p>
              <span className="font-medium">California (FTB):</span> Uses a different schedule with no Q3 payment:
              <span className="block ml-4 mt-1">• Q1 (Apr 15): 30% of annual tax • Q2 (Jun 16): 70% of annual tax • Q4 (Jan 15): 100% of annual tax</span>
            </p>
            <p className="text-xs mt-2 italic">
              Note: These percentages are cumulative. For example, if you need to pay $10,000 in federal taxes for the year, you should have paid $2,500 by Q1, $5,000 total by Q2, etc.
            </p>
          </div>
        </div>
        
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
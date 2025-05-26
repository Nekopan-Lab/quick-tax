import { useState } from 'react'
import { useStore } from '../../store/useStore'

interface IncomeProps {
  onNext: () => void
  onPrevious: () => void
}

interface FutureRSUVest {
  id: string
  date: string
  shares: string
  expectedPrice: string
}

export function Income({ onNext, onPrevious }: IncomeProps) {
  const [activeTab, setActiveTab] = useState<'user' | 'spouse'>('user')
  const { filingStatus, includeCaliforniaTax, userIncome, spouseIncome, setUserIncome, setSpouseIncome } = useStore()
  const showSpouseTab = filingStatus === 'marriedFilingJointly'
  
  // Get the current income data based on active tab
  const currentIncome = activeTab === 'user' ? userIncome : spouseIncome
  const setCurrentIncome = activeTab === 'user' ? setUserIncome : setSpouseIncome

  // Calculate tax withholding percentages from last vest
  const federalWithholdingRate = currentIncome.rsuVestWage && currentIncome.rsuVestFederal ? 
    (Number(currentIncome.rsuVestFederal) / Number(currentIncome.rsuVestWage)) : 0.22
  const stateWithholdingRate = currentIncome.rsuVestWage && currentIncome.rsuVestState ? 
    (Number(currentIncome.rsuVestState) / Number(currentIncome.rsuVestWage)) : 0.1

  const addFutureRSUVest = () => {
    const newVest: FutureRSUVest = {
      id: Date.now().toString(),
      date: '',
      shares: '',
      expectedPrice: currentIncome.vestPrice || ''
    }
    setCurrentIncome({ 
      futureRSUVests: [...currentIncome.futureRSUVests, newVest] 
    })
  }

  const updateFutureRSUVest = (id: string, field: keyof FutureRSUVest, value: string) => {
    setCurrentIncome({
      futureRSUVests: currentIncome.futureRSUVests.map(vest => 
        vest.id === id ? { ...vest, [field]: value } : vest
      )
    })
  }

  const removeFutureRSUVest = (id: string) => {
    setCurrentIncome({
      futureRSUVests: currentIncome.futureRSUVests.filter(vest => vest.id !== id)
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Income</h2>
      
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('user')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'user' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Your Income
            </button>
            {showSpouseTab && (
              <button
                onClick={() => setActiveTab('spouse')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'spouse' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                Spouse Income
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Investment Income Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Investment Income (Full Year Estimations)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordinary Dividends
                  </label>
                  <input
                    type="number"
                    value={currentIncome.ordinaryDividends}
                    onChange={(e) => setCurrentIncome({ ordinaryDividends: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualified Dividends
                    <span className="text-xs text-gray-500 ml-1">(portion of ordinary)</span>
                  </label>
                  <input
                    type="number"
                    value={currentIncome.qualifiedDividends}
                    onChange={(e) => setCurrentIncome({ qualifiedDividends: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Income
                  </label>
                  <input
                    type="number"
                    value={currentIncome.interestIncome}
                    onChange={(e) => setCurrentIncome({ interestIncome: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Capital Gains Section */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Capital Gains/Losses</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short-Term Capital Gains/Losses
                    </label>
                    <input
                      type="number"
                      value={currentIncome.shortTermGains}
                      onChange={(e) => setCurrentIncome({ shortTermGains: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Long-Term Capital Gains/Losses
                    </label>
                    <input
                      type="number"
                      value={currentIncome.longTermGains}
                      onChange={(e) => setCurrentIncome({ longTermGains: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* YTD W2 Income Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">YTD W2 Income</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxable Wage (YTD)
                </label>
                <input
                  type="number"
                  value={currentIncome.ytdWage}
                  onChange={(e) => setCurrentIncome({ ytdWage: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Federal Withhold (YTD)
                </label>
                <input
                  type="number"
                  value={currentIncome.ytdFederalWithhold}
                  onChange={(e) => setCurrentIncome({ ytdFederalWithhold: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {includeCaliforniaTax && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State Withhold (YTD)
                  </label>
                  <input
                    type="number"
                    value={currentIncome.ytdStateWithhold}
                    onChange={(e) => setCurrentIncome({ ytdStateWithhold: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Future Income Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Future Income</h3>
            
            {/* Mode Selection */}
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="simple"
                  checked={currentIncome.incomeMode === 'simple'}
                  onChange={() => setCurrentIncome({ incomeMode: 'simple' })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Simple Estimation</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="detailed"
                  checked={currentIncome.incomeMode === 'detailed'}
                  onChange={() => setCurrentIncome({ incomeMode: 'detailed' })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Detailed (Paycheck/RSU)</span>
              </label>
            </div>

            {currentIncome.incomeMode === 'simple' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Future Taxable Wage
                  </label>
                  <input
                    type="number"
                    value={currentIncome.futureWage}
                    onChange={(e) => setCurrentIncome({ futureWage: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Future Federal Withhold
                  </label>
                  <input
                    type="number"
                    value={currentIncome.futureFederalWithhold}
                    onChange={(e) => setCurrentIncome({ futureFederalWithhold: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {includeCaliforniaTax && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Future State Withhold
                    </label>
                    <input
                      type="number"
                      value={currentIncome.futureStateWithhold}
                      onChange={(e) => setCurrentIncome({ futureStateWithhold: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Paycheck Data */}
                <div>
                  <h4 className="font-medium mb-3">Most Recent Paycheck Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taxable Wage (per paycheck)
                      </label>
                      <input
                        type="number"
                        value={currentIncome.paycheckWage}
                        onChange={(e) => setCurrentIncome({ paycheckWage: e.target.value })}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Federal Withhold (per paycheck)
                      </label>
                      <input
                        type="number"
                        value={currentIncome.paycheckFederal}
                        onChange={(e) => setCurrentIncome({ paycheckFederal: e.target.value })}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {includeCaliforniaTax && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State Withhold (per paycheck)
                        </label>
                        <input
                          type="number"
                          value={currentIncome.paycheckState}
                          onChange={(e) => setCurrentIncome({ paycheckState: e.target.value })}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Frequency
                      </label>
                      <select
                        value={currentIncome.payFrequency}
                        onChange={(e) => setCurrentIncome({ payFrequency: e.target.value as 'biweekly' | 'monthly' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Payment Date
                      </label>
                      <input
                        type="date"
                        value={currentIncome.nextPayDate}
                        onChange={(e) => setCurrentIncome({ nextPayDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* RSU Data */}
                <div>
                  <h4 className="font-medium mb-3">RSU Vest Data</h4>
                  
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-sm">Last Vest Event (Optional)</h5>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        Used to calculate withholding rates
                      </span>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-md mb-4">
                      <p className="text-xs text-blue-800">
                        If you have RSU vest data, enter it below to calculate accurate withholding rates. 
                        Otherwise, we'll use default rates (22% federal, 10% state).
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Taxable Wage per Vest
                          <span className="text-xs text-gray-500 block">Optional - from last vest</span>
                        </label>
                        <input
                          type="number"
                          value={currentIncome.rsuVestWage}
                          onChange={(e) => setCurrentIncome({ rsuVestWage: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Federal Withhold per Vest
                          <span className="text-xs text-gray-500 block">Optional - from last vest</span>
                        </label>
                        <input
                          type="number"
                          value={currentIncome.rsuVestFederal}
                          onChange={(e) => setCurrentIncome({ rsuVestFederal: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      {includeCaliforniaTax && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State Withhold per Vest
                            <span className="text-xs text-gray-500 block">Optional - from last vest</span>
                          </label>
                          <input
                            type="number"
                            value={currentIncome.rsuVestState}
                            onChange={(e) => setCurrentIncome({ rsuVestState: e.target.value })}
                            placeholder="Optional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Price at Last Vest
                          <span className="text-xs text-gray-500 block">Optional - price per share</span>
                        </label>
                        <input
                          type="number"
                          value={currentIncome.vestPrice}
                          onChange={(e) => setCurrentIncome({ vestPrice: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">Future RSU Vesting Events</h5>
                      <button
                        type="button"
                        onClick={addFutureRSUVest}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                      >
                        + Add Vest
                      </button>
                    </div>

                    {currentIncome.futureRSUVests.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-md">
                        No future vests added. Click "Add Vest" to add upcoming RSU vesting events.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {currentIncome.futureRSUVests.map((vest) => {
                          const vestValue = Number(vest.shares) * Number(vest.expectedPrice)
                          const estimatedFederal = vestValue * federalWithholdingRate
                          const estimatedState = vestValue * stateWithholdingRate

                          return (
                            <div key={vest.id} className="border rounded-md p-4 bg-gray-50">
                              <div className="flex justify-between items-start mb-3">
                                <h6 className="font-medium text-sm">Future Vest</h6>
                                <button
                                  type="button"
                                  onClick={() => removeFutureRSUVest(vest.id)}
                                  className="text-red-600 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Vest Date
                                  </label>
                                  <input
                                    type="date"
                                    value={vest.date}
                                    onChange={(e) => updateFutureRSUVest(vest.id, 'date', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Number of Shares
                                  </label>
                                  <input
                                    type="number"
                                    value={vest.shares}
                                    onChange={(e) => updateFutureRSUVest(vest.id, 'shares', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Expected Price/Share
                                  </label>
                                  <input
                                    type="number"
                                    value={vest.expectedPrice}
                                    onChange={(e) => updateFutureRSUVest(vest.id, 'expectedPrice', e.target.value)}
                                    placeholder={currentIncome.vestPrice || "0"}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                              
                              {vest.shares && vest.expectedPrice && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-600">Est. Value:</span>
                                      <span className="ml-1 font-medium">${vestValue.toLocaleString()}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Est. Fed Tax Withhold:</span>
                                      <span className="ml-1 font-medium text-red-600">
                                        ${Math.round(estimatedFederal).toLocaleString()} 
                                        <span className="text-gray-500 ml-1">({(federalWithholdingRate * 100).toFixed(0)}%)</span>
                                      </span>
                                    </div>
                                    {includeCaliforniaTax && (
                                      <div>
                                        <span className="text-gray-600">Est. State Tax Withhold:</span>
                                        <span className="ml-1 font-medium text-red-600">
                                          ${Math.round(estimatedState).toLocaleString()}
                                          <span className="text-gray-500 ml-1">({(stateWithholdingRate * 100).toFixed(0)}%)</span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    {currentIncome.futureRSUVests.length > 0 && currentIncome.rsuVestWage && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-xs text-blue-800">
                          Tax withholding estimates are based on your last vest rates: 
                          Federal {(federalWithholdingRate * 100).toFixed(1)}%{includeCaliforniaTax && `, State ${(stateWithholdingRate * 100).toFixed(1)}%`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Total Income Display */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                <span className="font-medium">
                  {activeTab === 'user' ? 'Your' : 'Spouse'} Calculated Total Income:
                </span>
                <span className="text-lg font-semibold">$0</span>
              </div>
              {showSpouseTab && (
                <div className="text-sm text-gray-600 text-center">
                  Combined household income will be shown in the summary
                </div>
              )}
            </div>
          </div>
          
          {/* Spouse Income Reminder Button - Only show on Your Income tab when filing jointly */}
          {showSpouseTab && activeTab === 'user' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setActiveTab('spouse')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Spouse Income (Optional)
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Only needed if your spouse has income
              </p>
            </div>
          )}
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
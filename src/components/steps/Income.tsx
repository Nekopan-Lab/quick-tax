import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { 
  calculateIndividualTotalIncome,
  calculateWithholdingRates,
  calculateProjectedPaycheckIncome,
  calculateRSUVestValue
} from '../../calculators/utils/income'
import { numberInputProps } from '../../utils/inputHelpers'

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
  
  // State for tracking gains vs losses
  const [shortTermIsLoss, setShortTermIsLoss] = useState<{ user: boolean; spouse: boolean }>({
    user: Number(userIncome.shortTermGains) < 0,
    spouse: Number(spouseIncome.shortTermGains) < 0
  })
  const [longTermIsLoss, setLongTermIsLoss] = useState<{ user: boolean; spouse: boolean }>({
    user: Number(userIncome.longTermGains) < 0,
    spouse: Number(spouseIncome.longTermGains) < 0
  })
  
  // Get the current income data based on active tab
  const currentIncome = activeTab === 'user' ? userIncome : spouseIncome
  const setCurrentIncome = activeTab === 'user' ? setUserIncome : setSpouseIncome
  
  // Get current loss states for active tab
  const currentShortTermIsLoss = activeTab === 'user' ? shortTermIsLoss.user : shortTermIsLoss.spouse
  const currentLongTermIsLoss = activeTab === 'user' ? longTermIsLoss.user : longTermIsLoss.spouse
  
  // Calculate total income for display
  const totalIncome = calculateIndividualTotalIncome(currentIncome)

  // Calculate tax withholding percentages from last vest
  const { federalRate: federalWithholdingRate, stateRate: stateWithholdingRate } = calculateWithholdingRates(currentIncome)

  // Calculate projected paycheck income
  const {
    remainingPaychecks,
    projectedWage: projectedPaycheckIncome,
    projectedFederalWithhold: projectedPaycheckFederal,
    projectedStateWithhold: projectedPaycheckState
  } = calculateProjectedPaycheckIncome(currentIncome)

  const addFutureRSUVest = () => {
    const newVest: FutureRSUVest = {
      id: Date.now().toString(),
      date: '',
      shares: '',
      expectedPrice: ''
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
                  ? 'text-emerald-600 border-emerald-600' 
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
                    ? 'text-emerald-600 border-emerald-600' 
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
                    type="number" {...numberInputProps}
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
                    type="number" {...numberInputProps}
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
                    type="number" {...numberInputProps}
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
                      Short-Term Capital
                    </label>
                    <div className="flex items-stretch">
                      <button
                        type="button"
                        onClick={() => {
                          const newIsLoss = !currentShortTermIsLoss
                          setShortTermIsLoss({ ...shortTermIsLoss, [activeTab]: newIsLoss })
                          // If switching from gain to loss or vice versa, convert the value
                          if (currentIncome.shortTermGains) {
                            const absValue = Math.abs(Number(currentIncome.shortTermGains))
                            setCurrentIncome({ shortTermGains: newIsLoss ? `-${absValue}` : String(absValue) })
                          }
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-l-md border transition-colors ${
                          currentShortTermIsLoss 
                            ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100' 
                            : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                        }`}
                      >
                        {currentShortTermIsLoss ? 'Loss' : 'Gain'}
                      </button>
                      <input
                        type="number" {...numberInputProps}
                        value={currentIncome.shortTermGains ? Math.abs(Number(currentIncome.shortTermGains)).toString() : ''}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '' || value === '0') {
                            setCurrentIncome({ shortTermGains: value })
                          } else {
                            const numValue = Number(value)
                            setCurrentIncome({ 
                              shortTermGains: currentShortTermIsLoss ? `-${numValue}` : value 
                            })
                          }
                        }}
                        placeholder="0"
                        className="flex-1 px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Long-Term Capital
                    </label>
                    <div className="flex items-stretch">
                      <button
                        type="button"
                        onClick={() => {
                          const newIsLoss = !currentLongTermIsLoss
                          setLongTermIsLoss({ ...longTermIsLoss, [activeTab]: newIsLoss })
                          // If switching from gain to loss or vice versa, convert the value
                          if (currentIncome.longTermGains) {
                            const absValue = Math.abs(Number(currentIncome.longTermGains))
                            setCurrentIncome({ longTermGains: newIsLoss ? `-${absValue}` : String(absValue) })
                          }
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-l-md border transition-colors ${
                          currentLongTermIsLoss 
                            ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100' 
                            : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                        }`}
                      >
                        {currentLongTermIsLoss ? 'Loss' : 'Gain'}
                      </button>
                      <input
                        type="number" {...numberInputProps}
                        value={currentIncome.longTermGains ? Math.abs(Number(currentIncome.longTermGains)).toString() : ''}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '' || value === '0') {
                            setCurrentIncome({ longTermGains: value })
                          } else {
                            const numValue = Number(value)
                            setCurrentIncome({ 
                              longTermGains: currentLongTermIsLoss ? `-${numValue}` : value 
                            })
                          }
                        }}
                        placeholder="0"
                        className="flex-1 px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-md"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-amber-50 rounded-md">
                  <p className="text-xs text-amber-800">
                    <span className="font-medium">Note:</span> If your total capital losses exceed your capital gains, you can deduct up to $3,000 ($1,500 if married filing separately) against ordinary income. Any remaining losses carry forward to future years.
                  </p>
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
                  type="number" {...numberInputProps}
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
                  type="number" {...numberInputProps}
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
                    type="number" {...numberInputProps}
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
                  onChange={() => setCurrentIncome({ 
                    incomeMode: 'simple',
                    // Clear detailed mode fields
                    paycheckWage: '',
                    paycheckFederal: '',
                    paycheckState: '',
                    nextPayDate: '',
                    rsuVestWage: '',
                    rsuVestFederal: '',
                    rsuVestState: '',
                    vestPrice: '',
                    futureRSUVests: []
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Simple Estimation</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="detailed"
                  checked={currentIncome.incomeMode === 'detailed'}
                  onChange={() => setCurrentIncome({ 
                    incomeMode: 'detailed',
                    // Clear simple mode fields
                    futureWage: '',
                    futureFederalWithhold: '',
                    futureStateWithhold: ''
                  })}
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
                    type="number" {...numberInputProps}
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
                    type="number" {...numberInputProps}
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
                      type="number" {...numberInputProps}
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
                        type="number" {...numberInputProps}
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
                        type="number" {...numberInputProps}
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
                          type="number" {...numberInputProps}
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
                  
                  {/* Paycheck Projection Display */}
                  {currentIncome.nextPayDate && currentIncome.paycheckWage && (
                    <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                      <h5 className="text-sm font-medium text-emerald-900 mb-2">Paycheck Projection</h5>
                      <div className="space-y-1 text-sm text-emerald-800">
                        <p>
                          <span className="font-medium">{remainingPaychecks}</span> {currentIncome.payFrequency === 'biweekly' ? 'bi-weekly' : 'monthly'} paychecks remaining in {new Date().getFullYear()}
                        </p>
                        <p>
                          Projected Income: <span className="font-medium">${projectedPaycheckIncome.toLocaleString()}</span>
                        </p>
                        <p>
                          Projected Federal Withholding: <span className="font-medium">${projectedPaycheckFederal.toLocaleString()}</span>
                        </p>
                        {includeCaliforniaTax && (
                          <p>
                            Projected State Withholding: <span className="font-medium">${projectedPaycheckState.toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
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
                    
                    <div className="bg-emerald-50 p-3 rounded-md mb-4">
                      <p className="text-xs text-emerald-800">
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
                          type="number" {...numberInputProps}
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
                          type="number" {...numberInputProps}
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
                            type="number" {...numberInputProps}
                            value={currentIncome.rsuVestState}
                            onChange={(e) => setCurrentIncome({ rsuVestState: e.target.value })}
                            placeholder="Optional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">Future RSU Vesting Events</h5>
                      <button
                        type="button"
                        onClick={addFutureRSUVest}
                        className="text-sm bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700"
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
                          const {
                            vestValue,
                            estimatedFederal,
                            estimatedState,
                            federalRate,
                            stateRate
                          } = calculateRSUVestValue(vest.shares, vest.expectedPrice, currentIncome)

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
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Number of Shares
                                  </label>
                                  <input
                                    type="number" {...numberInputProps}
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
                                    type="number" {...numberInputProps}
                                    value={vest.expectedPrice}
                                    onChange={(e) => updateFutureRSUVest(vest.id, 'expectedPrice', e.target.value)}
                                    placeholder="0"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                              
                              {vest.shares && vest.expectedPrice && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                    <div className="flex flex-col sm:block">
                                      <span className="text-gray-600">Est. Value:</span>
                                      <span className="sm:ml-1 font-medium">${vestValue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col sm:block">
                                      <span className="text-gray-600">Est. Fed Tax:</span>
                                      <span className="sm:ml-1 font-medium text-red-600">
                                        ${Math.round(estimatedFederal).toLocaleString()} 
                                        <span className="text-gray-500 ml-1">({(federalRate * 100).toFixed(0)}%)</span>
                                      </span>
                                    </div>
                                    {includeCaliforniaTax && (
                                      <div className="flex flex-col sm:block">
                                        <span className="text-gray-600">Est. State Tax:</span>
                                        <span className="sm:ml-1 font-medium text-red-600">
                                          ${Math.round(estimatedState).toLocaleString()}
                                          <span className="text-gray-500 ml-1">({(stateRate * 100).toFixed(0)}%)</span>
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
                      <div className="mt-3 p-3 bg-emerald-50 rounded-md">
                        <p className="text-xs text-emerald-800">
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
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-md">
                <span className="font-medium">
                  {activeTab === 'user' ? 'Your' : 'Spouse'} Calculated Total Income:
                </span>
                <span className="text-lg font-semibold">${totalIncome.toLocaleString()}</span>
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
          className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Next
        </button>
      </div>
    </div>
  )
}
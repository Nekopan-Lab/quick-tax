import { useState } from 'react'

interface IncomeProps {
  onNext: () => void
  onPrevious: () => void
}

type IncomeMode = 'simple' | 'detailed'

export function Income({ onNext, onPrevious }: IncomeProps) {
  const [activeTab, setActiveTab] = useState<'user' | 'spouse'>('user')
  const [incomeMode, setIncomeMode] = useState<IncomeMode>('detailed')
  const showSpouseTab = false // TODO: Get from filing status

  // Investment Income states
  const [ordinaryDividends, setOrdinaryDividends] = useState('')
  const [qualifiedDividends, setQualifiedDividends] = useState('')
  const [interestIncome, setInterestIncome] = useState('')
  const [shortTermGains, setShortTermGains] = useState('')
  const [longTermGains, setLongTermGains] = useState('')

  // YTD W2 states
  const [ytdWage, setYtdWage] = useState('')
  const [ytdFederalWithhold, setYtdFederalWithhold] = useState('')
  const [ytdStateWithhold, setYtdStateWithhold] = useState('')

  // Future Income - Simple Mode
  const [futureWage, setFutureWage] = useState('')
  const [futureFederalWithhold, setFutureFederalWithhold] = useState('')
  const [futureStateWithhold, setFutureStateWithhold] = useState('')

  // Future Income - Detailed Mode
  const [paycheckWage, setPaycheckWage] = useState('')
  const [paycheckFederal, setPaycheckFederal] = useState('')
  const [paycheckState, setPaycheckState] = useState('')
  const [payFrequency, setPayFrequency] = useState<'biweekly' | 'monthly'>('biweekly')
  const [nextPayDate, setNextPayDate] = useState('')

  const [rsuVestWage, setRsuVestWage] = useState('')
  const [rsuVestFederal, setRsuVestFederal] = useState('')
  const [rsuVestState, setRsuVestState] = useState('')
  const [vestPrice, setVestPrice] = useState('')
  const [futureVests, setFutureVests] = useState('')
  const [expectedVestPrice, setExpectedVestPrice] = useState('')

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Step 3: Income</h2>
      
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordinary Dividends
                </label>
                <input
                  type="number"
                  value={ordinaryDividends}
                  onChange={(e) => setOrdinaryDividends(e.target.value)}
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
                  value={qualifiedDividends}
                  onChange={(e) => setQualifiedDividends(e.target.value)}
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
                  value={interestIncome}
                  onChange={(e) => setInterestIncome(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short-Term Capital Gains/Losses
                </label>
                <input
                  type="number"
                  value={shortTermGains}
                  onChange={(e) => setShortTermGains(e.target.value)}
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
                  value={longTermGains}
                  onChange={(e) => setLongTermGains(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
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
                  value={ytdWage}
                  onChange={(e) => setYtdWage(e.target.value)}
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
                  value={ytdFederalWithhold}
                  onChange={(e) => setYtdFederalWithhold(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State Withhold (YTD)
                </label>
                <input
                  type="number"
                  value={ytdStateWithhold}
                  onChange={(e) => setYtdStateWithhold(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
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
                  checked={incomeMode === 'simple'}
                  onChange={() => setIncomeMode('simple')}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Simple Estimation</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="detailed"
                  checked={incomeMode === 'detailed'}
                  onChange={() => setIncomeMode('detailed')}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Detailed (Paycheck/RSU)</span>
              </label>
            </div>

            {incomeMode === 'simple' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Future Taxable Wage
                  </label>
                  <input
                    type="number"
                    value={futureWage}
                    onChange={(e) => setFutureWage(e.target.value)}
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
                    value={futureFederalWithhold}
                    onChange={(e) => setFutureFederalWithhold(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Future State Withhold
                  </label>
                  <input
                    type="number"
                    value={futureStateWithhold}
                    onChange={(e) => setFutureStateWithhold(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
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
                        value={paycheckWage}
                        onChange={(e) => setPaycheckWage(e.target.value)}
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
                        value={paycheckFederal}
                        onChange={(e) => setPaycheckFederal(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State Withhold (per paycheck)
                      </label>
                      <input
                        type="number"
                        value={paycheckState}
                        onChange={(e) => setPaycheckState(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Frequency
                      </label>
                      <select
                        value={payFrequency}
                        onChange={(e) => setPayFrequency(e.target.value as 'biweekly' | 'monthly')}
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
                        value={nextPayDate}
                        onChange={(e) => setNextPayDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* RSU Data */}
                <div>
                  <h4 className="font-medium mb-3">RSU Vest Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taxable Wage (per vest)
                      </label>
                      <input
                        type="number"
                        value={rsuVestWage}
                        onChange={(e) => setRsuVestWage(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Federal Withhold (per vest)
                      </label>
                      <input
                        type="number"
                        value={rsuVestFederal}
                        onChange={(e) => setRsuVestFederal(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State Withhold (per vest)
                      </label>
                      <input
                        type="number"
                        value={rsuVestState}
                        onChange={(e) => setRsuVestState(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vest Price (per share)
                      </label>
                      <input
                        type="number"
                        value={vestPrice}
                        onChange={(e) => setVestPrice(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Future RSU Vests (count)
                      </label>
                      <input
                        type="number"
                        value={futureVests}
                        onChange={(e) => setFutureVests(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Vest Price
                      </label>
                      <input
                        type="number"
                        value={expectedVestPrice}
                        onChange={(e) => setExpectedVestPrice(e.target.value)}
                        placeholder={vestPrice || "0"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Total Income Display */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
              <span className="font-medium">Calculated Total Income:</span>
              <span className="text-lg font-semibold">$0</span>
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
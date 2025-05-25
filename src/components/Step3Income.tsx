import React from 'react';
import { TaxFormData, PersonIncome } from '../types';

interface Step3IncomeProps {
  formData: TaxFormData;
  updateUserIncome: (income: Partial<PersonIncome>) => void;
  updateSpouseIncome: (income: Partial<PersonIncome>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface PersonIncomeFormProps {
  title: string;
  income: PersonIncome;
  updateIncome: (income: Partial<PersonIncome>) => void;
  includeCaliforniaTax: boolean;
}

function PersonIncomeForm({ title, income, updateIncome, includeCaliforniaTax }: PersonIncomeFormProps) {
  const handleNumberChange = (field: keyof PersonIncome, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateIncome({ [field]: numValue });
  };

  const handlePaycheckChange = (field: string, value: string | number) => {
    updateIncome({
      paycheckData: {
        ...income.paycheckData!,
        [field]: value,
      },
    });
  };

  const handleRSUChange = (field: string, value: number) => {
    updateIncome({
      rsuVestData: {
        ...income.rsuVestData!,
        [field]: value,
      },
    });
  };

  const handleFutureRSUChange = (field: string, value: number) => {
    updateIncome({
      futureRSUVests: {
        ...income.futureRSUVests!,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-100">{title}</h3>

      {/* Investment Income */}
      <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-200">Investment Income (Full Year Estimates)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Ordinary Dividends
            </label>
            <input
              type="number"
              value={income.ordinaryDividends || ''}
              onChange={(e) => handleNumberChange('ordinaryDividends', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Qualified Dividends
              <span className="text-xs text-gray-400 ml-1">(portion of ordinary)</span>
            </label>
            <input
              type="number"
              value={income.qualifiedDividends || ''}
              onChange={(e) => handleNumberChange('qualifiedDividends', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Interest Income
            </label>
            <input
              type="number"
              value={income.interestIncome || ''}
              onChange={(e) => handleNumberChange('interestIncome', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Short-Term Capital Gains/Losses
            </label>
            <input
              type="number"
              value={income.shortTermCapitalGains || ''}
              onChange={(e) => handleNumberChange('shortTermCapitalGains', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Long-Term Capital Gains/Losses
            </label>
            <input
              type="number"
              value={income.longTermCapitalGains || ''}
              onChange={(e) => handleNumberChange('longTermCapitalGains', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* YTD W2 Income */}
      <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-200">YTD W2 Income</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Taxable Wage (YTD)
            </label>
            <input
              type="number"
              value={income.ytdTaxableWage || ''}
              onChange={(e) => handleNumberChange('ytdTaxableWage', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Federal Withhold (YTD)
            </label>
            <input
              type="number"
              value={income.ytdFederalWithhold || ''}
              onChange={(e) => handleNumberChange('ytdFederalWithhold', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {includeCaliforniaTax && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                State Withhold (YTD)
              </label>
              <input
                type="number"
                value={income.ytdStateWithhold || ''}
                onChange={(e) => handleNumberChange('ytdStateWithhold', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Future Income Mode Selection */}
      <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
        <h4 className="text-lg font-medium text-gray-200">Future Income</h4>
        
        <div className="flex space-x-4 mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name={`${title}-futureMode`}
              value="simple"
              checked={income.futureIncomeMode === 'simple'}
              onChange={() => updateIncome({ futureIncomeMode: 'simple' })}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
            />
            <span className="text-gray-200">Simple Estimation</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name={`${title}-futureMode`}
              value="detailed"
              checked={income.futureIncomeMode === 'detailed'}
              onChange={() => updateIncome({ futureIncomeMode: 'detailed' })}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
            />
            <span className="text-gray-200">Detailed (Paycheck/RSU)</span>
          </label>
        </div>

        {income.futureIncomeMode === 'simple' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Est. Future Taxable Wage
              </label>
              <input
                type="number"
                value={income.estimatedFutureTaxableWage || ''}
                onChange={(e) => handleNumberChange('estimatedFutureTaxableWage', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Est. Future Federal Withhold
              </label>
              <input
                type="number"
                value={income.estimatedFutureFederalWithhold || ''}
                onChange={(e) => handleNumberChange('estimatedFutureFederalWithhold', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {includeCaliforniaTax && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Est. Future State Withhold
                </label>
                <input
                  type="number"
                  value={income.estimatedFutureStateWithhold || ''}
                  onChange={(e) => handleNumberChange('estimatedFutureStateWithhold', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Paycheck Data */}
            <div>
              <h5 className="text-md font-medium text-gray-300 mb-2">Most Recent Paycheck Data</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Taxable Wage per Paycheck
                  </label>
                  <input
                    type="number"
                    value={income.paycheckData?.taxableWagePerPaycheck || ''}
                    onChange={(e) => handlePaycheckChange('taxableWagePerPaycheck', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Federal Withhold per Paycheck
                  </label>
                  <input
                    type="number"
                    value={income.paycheckData?.federalWithholdPerPaycheck || ''}
                    onChange={(e) => handlePaycheckChange('federalWithholdPerPaycheck', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {includeCaliforniaTax && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      State Withhold per Paycheck
                    </label>
                    <input
                      type="number"
                      value={income.paycheckData?.stateWithholdPerPaycheck || ''}
                      onChange={(e) => handlePaycheckChange('stateWithholdPerPaycheck', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Payment Frequency
                  </label>
                  <select
                    value={income.paycheckData?.paymentFrequency || 'biweekly'}
                    onChange={(e) => handlePaycheckChange('paymentFrequency', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Next Payment Date
                  </label>
                  <input
                    type="date"
                    value={income.paycheckData?.nextPaymentDate || ''}
                    onChange={(e) => handlePaycheckChange('nextPaymentDate', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* RSU Data */}
            <div>
              <h5 className="text-md font-medium text-gray-300 mb-2">RSU Vest Data</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Taxable Wage per Vest
                  </label>
                  <input
                    type="number"
                    value={income.rsuVestData?.taxableWagePerVest || ''}
                    onChange={(e) => handleRSUChange('taxableWagePerVest', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Federal Withhold per Vest
                  </label>
                  <input
                    type="number"
                    value={income.rsuVestData?.federalWithholdPerVest || ''}
                    onChange={(e) => handleRSUChange('federalWithholdPerVest', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {includeCaliforniaTax && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      State Withhold per Vest
                    </label>
                    <input
                      type="number"
                      value={income.rsuVestData?.stateWithholdPerVest || ''}
                      onChange={(e) => handleRSUChange('stateWithholdPerVest', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Vest Price per Share
                  </label>
                  <input
                    type="number"
                    value={income.rsuVestData?.vestPrice || ''}
                    onChange={(e) => handleRSUChange('vestPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Number of Future RSU Vests
                  </label>
                  <input
                    type="number"
                    value={income.futureRSUVests?.numberOfVests || ''}
                    onChange={(e) => handleFutureRSUChange('numberOfVests', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Expected Vest Price
                  </label>
                  <input
                    type="number"
                    value={income.futureRSUVests?.expectedVestPrice || ''}
                    onChange={(e) => handleFutureRSUChange('expectedVestPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Step3Income({
  formData,
  updateUserIncome,
  updateSpouseIncome,
  onNext,
  onPrevious,
}: Step3IncomeProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-100">Step 3: Income</h2>
      
      <PersonIncomeForm
        title="User Income"
        income={formData.userIncome}
        updateIncome={updateUserIncome}
        includeCaliforniaTax={formData.includeCaliforniaTax}
      />
      
      {formData.filingStatus === 'marriedFilingJointly' && formData.spouseIncome && (
        <>
          <div className="border-t border-gray-700 my-8"></div>
          <PersonIncomeForm
            title="Spouse Income"
            income={formData.spouseIncome}
            updateIncome={updateSpouseIncome}
            includeCaliforniaTax={formData.includeCaliforniaTax}
          />
        </>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
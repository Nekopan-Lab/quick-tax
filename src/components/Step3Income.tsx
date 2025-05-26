import React from 'react';
import { TaxFormData, PersonIncome } from '../types';
import { ToggleGroup } from './ToggleGroup';

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
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>

      {/* Investment Income */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Investment Income (Full Year Estimates)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordinary Dividends
            </label>
            <input
              type="number"
              value={income.ordinaryDividends || ''}
              onChange={(e) => handleNumberChange('ordinaryDividends', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualified Dividends
              <span className="text-xs text-gray-500 ml-1">(portion of ordinary)</span>
            </label>
            <input
              type="number"
              value={income.qualifiedDividends || ''}
              onChange={(e) => handleNumberChange('qualifiedDividends', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Income
            </label>
            <input
              type="number"
              value={income.interestIncome || ''}
              onChange={(e) => handleNumberChange('interestIncome', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short-Term Capital Gains/Losses
            </label>
            <input
              type="number"
              value={income.shortTermCapitalGains || ''}
              onChange={(e) => handleNumberChange('shortTermCapitalGains', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Long-Term Capital Gains/Losses
            </label>
            <input
              type="number"
              value={income.longTermCapitalGains || ''}
              onChange={(e) => handleNumberChange('longTermCapitalGains', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* YTD W2 Income */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
        <h4 className="text-lg font-medium text-gray-900">YTD W2 Income</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taxable Wage (YTD)
            </label>
            <input
              type="number"
              value={income.ytdTaxableWage || ''}
              onChange={(e) => handleNumberChange('ytdTaxableWage', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Federal Withhold (YTD)
            </label>
            <input
              type="number"
              value={income.ytdFederalWithhold || ''}
              onChange={(e) => handleNumberChange('ytdFederalWithhold', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {includeCaliforniaTax && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State Withhold (YTD)
              </label>
              <input
                type="number"
                value={income.ytdStateWithhold || ''}
                onChange={(e) => handleNumberChange('ytdStateWithhold', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Future Income Mode Selection */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Future Income</h4>
        
        <ToggleGroup
          options={[
            { value: 'simple', label: 'Simple Estimation' },
            { value: 'detailed', label: 'Detailed (Paycheck/RSU)' }
          ]}
          value={income.futureIncomeMode}
          onChange={(value) => updateIncome({ futureIncomeMode: value as 'simple' | 'detailed' })}
          className="mb-4"
        />

        {income.futureIncomeMode === 'simple' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Est. Future Taxable Wage
              </label>
              <input
                type="number"
                value={income.estimatedFutureTaxableWage || ''}
                onChange={(e) => handleNumberChange('estimatedFutureTaxableWage', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Est. Future Federal Withhold
              </label>
              <input
                type="number"
                value={income.estimatedFutureFederalWithhold || ''}
                onChange={(e) => handleNumberChange('estimatedFutureFederalWithhold', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {includeCaliforniaTax && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Est. Future State Withhold
                </label>
                <input
                  type="number"
                  value={income.estimatedFutureStateWithhold || ''}
                  onChange={(e) => handleNumberChange('estimatedFutureStateWithhold', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Paycheck Data */}
            <div>
              <h5 className="text-md font-medium text-gray-700 mb-2">Most Recent Paycheck Data</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxable Wage per Paycheck
                  </label>
                  <input
                    type="number"
                    value={income.paycheckData?.taxableWagePerPaycheck || ''}
                    onChange={(e) => handlePaycheckChange('taxableWagePerPaycheck', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Federal Withhold per Paycheck
                  </label>
                  <input
                    type="number"
                    value={income.paycheckData?.federalWithholdPerPaycheck || ''}
                    onChange={(e) => handlePaycheckChange('federalWithholdPerPaycheck', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {includeCaliforniaTax && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State Withhold per Paycheck
                    </label>
                    <input
                      type="number"
                      value={income.paycheckData?.stateWithholdPerPaycheck || ''}
                      onChange={(e) => handlePaycheckChange('stateWithholdPerPaycheck', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Frequency
                  </label>
                  <select
                    value={income.paycheckData?.paymentFrequency || 'biweekly'}
                    onChange={(e) => handlePaycheckChange('paymentFrequency', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={income.paycheckData?.nextPaymentDate || ''}
                    onChange={(e) => handlePaycheckChange('nextPaymentDate', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* RSU Data */}
            <div>
              <h5 className="text-md font-medium text-gray-700 mb-2">RSU Vest Data</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxable Wage per Vest
                  </label>
                  <input
                    type="number"
                    value={income.rsuVestData?.taxableWagePerVest || ''}
                    onChange={(e) => handleRSUChange('taxableWagePerVest', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Federal Withhold per Vest
                  </label>
                  <input
                    type="number"
                    value={income.rsuVestData?.federalWithholdPerVest || ''}
                    onChange={(e) => handleRSUChange('federalWithholdPerVest', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {includeCaliforniaTax && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State Withhold per Vest
                    </label>
                    <input
                      type="number"
                      value={income.rsuVestData?.stateWithholdPerVest || ''}
                      onChange={(e) => handleRSUChange('stateWithholdPerVest', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vest Price per Share
                  </label>
                  <input
                    type="number"
                    value={income.rsuVestData?.vestPrice || ''}
                    onChange={(e) => handleRSUChange('vestPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Future RSU Vests
                  </label>
                  <input
                    type="number"
                    value={income.futureRSUVests?.numberOfVests || ''}
                    onChange={(e) => handleFutureRSUChange('numberOfVests', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Vest Price
                  </label>
                  <input
                    type="number"
                    value={income.futureRSUVests?.expectedVestPrice || ''}
                    onChange={(e) => handleFutureRSUChange('expectedVestPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 3: Income</h2>
        <p className="text-gray-600">Enter your income information for accurate tax calculations</p>
      </div>
      
      <PersonIncomeForm
        title="User Income"
        income={formData.userIncome}
        updateIncome={updateUserIncome}
        includeCaliforniaTax={formData.includeCaliforniaTax}
      />
      
      {formData.filingStatus === 'marriedFilingJointly' && formData.spouseIncome && (
        <>
          <div className="border-t border-gray-200 my-8"></div>
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
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md font-medium"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
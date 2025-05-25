import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { TaxOwedDisplay } from './components/TaxOwedDisplay';
import { Step1FilingStatus } from './components/Step1FilingStatus';
import { Step2Deductions } from './components/Step2Deductions';
import { Step3Income } from './components/Step3Income';
import { Step4EstimatedPayments } from './components/Step4EstimatedPayments';
import { Step5Summary } from './components/Step5Summary';
import { useFormData } from './hooks/useFormData';
import { calculateTaxes } from './calculations';
import { TaxCalculationResult } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [taxResult, setTaxResult] = useState<TaxCalculationResult | null>(null);

  const {
    formData,
    updateFilingStatus,
    updateCaliforniaTaxScope,
    updateDeductions,
    updateUserIncome,
    updateSpouseIncome,
    updateFederalEstimatedPayments,
    updateCaliforniaEstimatedPayments,
    resetFormData,
  } = useFormData();

  // Calculate taxes whenever form data changes
  useEffect(() => {
    try {
      const result = calculateTaxes(formData);
      setTaxResult(result);
    } catch (error) {
      console.error('Tax calculation error:', error);
    }
  }, [formData]);

  const handleStepNavigation = (step: number) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDeleteData = () => {
    if (window.confirm('Are you sure you want to delete all your saved data?')) {
      resetFormData();
      setCurrentStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">QuickTax</h1>
          <p className="text-gray-400">2025 Tax Year Estimator</p>
        </header>

        {/* Disclaimer */}
        {showDisclaimer && (
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-yellow-200 font-medium mb-1">Important Disclaimer</p>
                <p className="text-sm text-gray-300">
                  QuickTax is intended solely as a planning tool for estimated tax payments and is not a substitute for professional tax advice, 
                  official tax filing software, or the services of a licensed tax preparer.
                </p>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="text-xs text-yellow-400 hover:text-yellow-300 mt-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Data Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDeleteData}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Delete All Data
          </button>
        </div>

        {/* Tax Owed Display */}
        <TaxOwedDisplay result={taxResult} includeCaliforniaTax={formData.includeCaliforniaTax} />

        {/* Navigation */}
        <Navigation currentStep={currentStep} onStepClick={handleStepNavigation} />

        {/* Main Content */}
        <main className="bg-gray-800/50 rounded-lg p-6">
          {currentStep === 1 && (
            <Step1FilingStatus
              formData={formData}
              updateFilingStatus={updateFilingStatus}
              updateCaliforniaTaxScope={updateCaliforniaTaxScope}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <Step2Deductions
              formData={formData}
              updateDeductions={updateDeductions}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          {currentStep === 3 && (
            <Step3Income
              formData={formData}
              updateUserIncome={updateUserIncome}
              updateSpouseIncome={updateSpouseIncome}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          {currentStep === 4 && (
            <Step4EstimatedPayments
              formData={formData}
              updateFederalEstimatedPayments={updateFederalEstimatedPayments}
              updateCaliforniaEstimatedPayments={updateCaliforniaEstimatedPayments}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          {currentStep === 5 && (
            <Step5Summary
              result={taxResult}
              includeCaliforniaTax={formData.includeCaliforniaTax}
              onPrevious={handlePrevious}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <button
            onClick={() => setShowPrivacyPopup(true)}
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Privacy Policy
          </button>
        </footer>

        {/* Privacy Popup */}
        {showPrivacyPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold mb-3">Privacy Policy</h3>
              <p className="text-sm text-gray-300 mb-4">
                Your privacy is paramount. All data entered into QuickTax is stored only on your local device 
                and is never sent to our servers. This allows you to pick up where you left off or update your 
                estimates throughout the year. For complete privacy, you can delete all stored data at any time.
              </p>
              <button
                onClick={() => setShowPrivacyPopup(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
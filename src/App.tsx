import { useState, useEffect } from 'react'
import { useStore } from './store/useStore'
import { calculateComprehensiveTax } from './calculators/orchestrator'
import { TaxYear } from './types'
import { StepNavigation } from './components/layout/StepNavigation'
import { FilingStatus } from './components/steps/FilingStatus'
import { Deductions } from './components/steps/Deductions'
import { Income } from './components/steps/Income'
import { EstimatedPayments } from './components/steps/EstimatedPayments'
import { Summary } from './components/steps/Summary'
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt'
import { VersionInfo } from './components/VersionInfo'
import { DEMO_USER_INCOME, DEMO_SPOUSE_INCOME, DEMO_DEDUCTIONS, DEMO_ESTIMATED_PAYMENTS, DEMO_DATA_DESCRIPTION } from './utils/demoData'

function App() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  
  const { 
    currentStep,
    setCurrentStep,
    clearAllData,
    taxYear,
    filingStatus,
    includeCaliforniaTax,
    deductions,
    userIncome,
    spouseIncome,
    estimatedPayments,
    setUserIncome,
    setSpouseIncome,
    setDeductions,
    setEstimatedPayments
  } = useStore()

  // Calculate real-time tax results
  const taxResults = calculateComprehensiveTax(
    taxYear as TaxYear,
    filingStatus,
    includeCaliforniaTax,
    deductions,
    userIncome,
    spouseIncome,
    estimatedPayments
  )

  const federalOwed = taxResults?.federalTax.owedOrRefund || 0
  const californiaOwed = taxResults?.californiaTax?.owedOrRefund || 0

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Fix for mobile rendering issue after PWA update
  useEffect(() => {
    // Force a reflow/repaint on mobile devices after page load
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      const forceReflow = () => {
        // Force the browser to recalculate layout
        document.body.style.display = 'none';
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
        
        // Also ensure we're at the top of the page
        window.scrollTo(0, 0);
      };
      
      // Run after a short delay to ensure DOM is fully loaded
      const timer = setTimeout(forceReflow, 100);
      
      // Also run on visibility change (for when app comes back from background)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          forceReflow();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [])

  // Ensure theme color is always up to date
  useEffect(() => {
    const updateThemeColor = () => {
      const themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
      if (themeColorMeta && themeColorMeta.content !== '#10b981') {
        themeColorMeta.content = '#10b981';
        console.log('[PWA] Theme color updated to emerald');
      }
    };
    
    // Update on load
    updateThemeColor();
    
    // Also update when app becomes visible (useful for installed PWAs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateThemeColor();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [])

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    setCurrentStep(step)
  }

  const handleClearData = () => {
    clearAllData()
    window.location.reload()
  }

  const handleLoadDemo = () => {
    // Load demo data into the store
    setUserIncome(DEMO_USER_INCOME)
    setSpouseIncome(DEMO_SPOUSE_INCOME)
    setDeductions(DEMO_DEDUCTIONS)
    setEstimatedPayments(DEMO_ESTIMATED_PAYMENTS)
    setCurrentStep(1) // Reset to first step when loading demo
    setShowDemoModal(false)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FilingStatus onNext={handleNext} />
      case 2:
        return <Income onNext={handleNext} onPrevious={handlePrevious} />
      case 3:
        return <Deductions onNext={handleNext} onPrevious={handlePrevious} />
      case 4:
        return <EstimatedPayments onNext={handleNext} onPrevious={handlePrevious} />
      case 5:
        return <Summary onPrevious={handlePrevious} taxResults={taxResults} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QuickTax</h1>
              <p className="text-sm text-gray-600">Estimated Tax Calculator</p>
            </div>
            
            {/* Tax Status Display */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Federal Tax</div>
                {federalOwed > 0 ? (
                  <div className="text-lg font-bold text-red-600">${federalOwed.toLocaleString()} Owed</div>
                ) : federalOwed < 0 ? (
                  <div className="text-lg font-bold text-green-600">${Math.abs(federalOwed).toLocaleString()} Overpaid</div>
                ) : (
                  <div className="text-lg font-bold text-gray-600">$0 Balanced</div>
                )}
              </div>
              
              {includeCaliforniaTax && (
                <>
                  <div className="w-px h-10 bg-gray-300" />
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">California Tax</div>
                    {californiaOwed > 0 ? (
                      <div className="text-lg font-bold text-red-600">${californiaOwed.toLocaleString()} Owed</div>
                    ) : californiaOwed < 0 ? (
                      <div className="text-lg font-bold text-green-600">${Math.abs(californiaOwed).toLocaleString()} Overpaid</div>
                    ) : (
                      <div className="text-lg font-bold text-gray-600">$0 Balanced</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {currentStep > 0 && (
        <StepNavigation currentStep={currentStep} onStepClick={handleStepClick} />
      )}
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <main className="min-h-[60vh]">
          {renderStep()}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          {/* Prominent Disclaimer */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-900 mb-1">Important Disclaimer</h3>
                <p className="text-sm text-amber-800">
                  QuickTax is an <strong>estimation tool only</strong> and does not constitute professional tax advice or licensed tax preparation. 
                  This tool is intended solely for planning purposes. Please consult a qualified tax professional for official tax filing.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Privacy Policy
              </button>
              <span className="text-sm text-gray-400">•</span>
              <a
                href="https://github.com/denehs/quick-tax"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                GitHub
              </a>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDemoModal(true)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium border border-purple-300 rounded-md px-4 py-2 hover:bg-purple-50 transition-colors"
              >
                Load Demo
              </button>
              
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete all stored data? This cannot be undone.')) {
                    handleClearData()
                  }
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-300 rounded-md px-4 py-2 hover:bg-red-50 transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            <div>© 2025 QuickTax. For estimation purposes only.</div>
            <div className="mt-1"><VersionInfo /></div>
          </div>
        </div>
      </footer>

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Privacy Policy</h3>
            <div className="text-gray-700 space-y-3 mb-6">
              <p>
                Your privacy is paramount. All data entered into QuickTax is stored 
                <strong> only</strong> on your local device and is never sent to our servers.
              </p>
              <p>
                This allows you to pick up where you left off or update your estimates 
                throughout the year. For complete privacy, you can delete all stored data 
                at any time using the "Clear All Data" button.
              </p>
              <p>
                We do not collect, store, or transmit any of your financial information. 
                All tax calculations are performed entirely within your browser.
              </p>
            </div>
            <button 
              className="w-full py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium"
              onClick={() => setShowPrivacyModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Load Demo Data</h3>
            <div className="text-gray-700 whitespace-pre-line text-sm mb-6">
              {DEMO_DATA_DESCRIPTION}
            </div>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                onClick={() => setShowDemoModal(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
                onClick={handleLoadDemo}
              >
                Load Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Update Prompt */}
      <PWAUpdatePrompt />
    </div>
  )
}

export default App
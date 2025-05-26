import { useState } from 'react'
import { useStore } from './store/useStore'
import { StepNavigation } from './components/layout/StepNavigation'
import { Welcome } from './components/steps/Welcome'
import { FilingStatus } from './components/steps/FilingStatus'
import { Deductions } from './components/steps/Deductions'
import { Income } from './components/steps/Income'
import { EstimatedPayments } from './components/steps/EstimatedPayments'
import { Summary } from './components/steps/Summary'

function App() {
  const [currentStep, setCurrentStep] = useState(1) // Start at Step 1
  const { clearAllData } = useStore()

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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Welcome onStart={() => setCurrentStep(1)} onClearData={handleClearData} />
      case 1:
        return <FilingStatus onNext={handleNext} onPrevious={handlePrevious} />
      case 2:
        return <Deductions onNext={handleNext} onPrevious={handlePrevious} />
      case 3:
        return <Income onNext={handleNext} onPrevious={handlePrevious} />
      case 4:
        return <EstimatedPayments onNext={handleNext} onPrevious={handlePrevious} />
      case 5:
        return <Summary onPrevious={handlePrevious} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QuickTax</h1>
              <p className="text-sm text-gray-600">2025 Tax Year Estimator</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete all stored data?')) {
                  handleClearData()
                }
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </header>

      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="container mx-auto px-4 py-3">
          <p className="text-sm text-amber-800 text-center">
            <strong>⚠️ Disclaimer:</strong> This tool is for estimation purposes only and does not constitute professional tax advice.
          </p>
        </div>
      </div>

      {/* Navigation */}
      {currentStep > 0 && (
        <StepNavigation currentStep={currentStep} onStepClick={handleStepClick} />
      )}
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <main>
          {renderStep()}
        </main>
      </div>
    </div>
  )
}

export default App
import { useState } from 'react'
import { useStore } from './store/useStore'

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const { filingStatus, setFilingStatus } = useStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">QuickTax</h1>
          <p className="text-gray-600">2025 Tax Year Estimator</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This tool is for estimation purposes only and does not constitute 
              professional tax advice or licensed tax preparation.
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4">Welcome to QuickTax</h2>
            <p className="text-gray-700 mb-6">
              This application will help you estimate your 2025 federal and California state taxes.
              All data is stored locally in your browser.
            </p>
            
            <div className="space-y-4">
              <button 
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setCurrentStep(1)}
              >
                Start New Estimation
              </button>
              
              <button className="w-full py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                Load Previous Data
              </button>
            </div>
          </div>
        </main>

        <footer className="text-center mt-12 text-sm text-gray-500">
          <button className="underline hover:text-gray-700">Privacy Policy</button>
        </footer>
      </div>
    </div>
  )
}

export default App
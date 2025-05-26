import { useState } from 'react'

interface WelcomeProps {
  onStart: () => void
  onClearData: () => void
}

export function Welcome({ onStart, onClearData }: WelcomeProps) {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">QuickTax</h1>
          <p className="text-gray-600">Estimated Tax Calculator</p>
          
          <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg max-w-3xl mx-auto">
            <p className="text-base font-medium text-amber-900">
              <strong className="text-lg">⚠️ IMPORTANT DISCLAIMER</strong>
            </p>
            <p className="text-sm text-amber-800 mt-2">
              QuickTax is intended solely as a planning tool for <em>estimated</em> tax payments 
              and is <strong>not</strong> a substitute for professional tax advice, official tax 
              filing software, or the services of a licensed tax preparer.
            </p>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to QuickTax</h2>
          <p className="text-gray-700 mb-6">
            This application will help you estimate your federal and California state taxes 
            throughout the tax year. All data is stored locally in your browser for privacy and 
            convenience.
          </p>
          
          <div className="space-y-4">
            <button 
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              onClick={onStart}
            >
              Start New Estimation
            </button>
            
            <button 
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
              onClick={() => window.location.reload()}
            >
              Load Previous Data
            </button>
            
            <button 
              className="w-full py-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors font-medium"
              onClick={() => {
                if (confirm('Are you sure you want to delete all stored data? This cannot be undone.')) {
                  onClearData()
                }
              }}
            >
              Delete All Data
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center mt-12 text-sm text-gray-500">
        <button 
          className="underline hover:text-gray-700"
          onClick={() => setShowPrivacyModal(true)}
        >
          Privacy Policy
        </button>
      </footer>

      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Privacy Policy</h3>
            <p className="text-gray-700 mb-4">
              Your privacy is paramount. All data entered into QuickTax is stored 
              <strong> only</strong> on your local device and is never sent to our servers. 
              This allows you to pick up where you left off or update your estimates 
              throughout the year. For complete privacy, you can delete all stored data 
              at any time.
            </p>
            <button 
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => setShowPrivacyModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
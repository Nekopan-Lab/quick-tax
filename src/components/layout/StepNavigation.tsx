interface StepNavigationProps {
  currentStep: number
  onStepClick: (step: number) => void
}

const steps = [
  { id: 1, name: 'Filing Status' },
  { id: 2, name: 'Deductions' },
  { id: 3, name: 'Income' },
  { id: 4, name: 'Estimated Payments' },
  { id: 5, name: 'Summary' }
]

export function StepNavigation({ currentStep, onStepClick }: StepNavigationProps) {
  return (
    <div className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <nav className="py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => onStepClick(step.id)}
                  className={`
                    flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${currentStep === step.id 
                      ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                      : currentStep > step.id
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }
                  `}
                >
                  <span className={`
                    flex items-center justify-center w-8 h-8 rounded-full mr-3
                    ${currentStep === step.id 
                      ? 'bg-white text-blue-600' 
                      : currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                    }
                  `}>
                    {currentStep > step.id ? '✓' : step.id}
                  </span>
                  <span className="hidden sm:block">{step.name}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-2 rounded
                    ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
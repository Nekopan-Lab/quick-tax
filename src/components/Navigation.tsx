import React from 'react';

interface NavigationProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const steps = [
  { number: 1, name: 'Filing Status' },
  { number: 2, name: 'Deductions' },
  { number: 3, name: 'Income' },
  { number: 4, name: 'Estimated Payments' },
  { number: 5, name: 'Summary' },
];

export function Navigation({ currentStep, onStepClick }: NavigationProps) {
  return (
    <nav className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <button
              onClick={() => onStepClick(step.number)}
              className={`flex items-center ${
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
              } hover:text-blue-500 transition-colors`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.number
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.number
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">
                {step.name}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}
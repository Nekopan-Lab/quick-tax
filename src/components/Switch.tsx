import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export function Switch({ checked, onChange, label, className = '' }: SwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center space-x-3 ${className}`}
    >
      <div className="relative">
        <div className={`
          w-12 h-6 rounded-full transition-colors duration-200
          ${checked ? 'bg-blue-600' : 'bg-gray-300'}
        `}>
          <div className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
            transform transition-transform duration-200
            ${checked ? 'translate-x-6' : 'translate-x-0'}
          `} />
        </div>
      </div>
      <span className="text-gray-700 font-medium">{label}</span>
    </button>
  );
}
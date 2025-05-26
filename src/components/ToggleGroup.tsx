import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface ToggleGroupProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ToggleGroup({ options, value, onChange, className = '' }: ToggleGroupProps) {
  return (
    <div className={`inline-flex rounded-lg bg-gray-100 p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-all
            ${value === option.value 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
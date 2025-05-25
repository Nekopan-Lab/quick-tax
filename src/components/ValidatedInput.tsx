import React from 'react';

interface ValidatedInputProps {
  label: string;
  type?: 'text' | 'number' | 'date';
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export function ValidatedInput({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder = '0',
  disabled = false,
  hint,
  min,
  max,
  step,
}: ValidatedInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
        {hint && <span className="text-xs text-gray-400 ml-1">{hint}</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
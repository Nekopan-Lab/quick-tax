import { useState, useCallback } from 'react';
import { ValidationResult } from '../utils/validation';

export function useValidatedInput<T>(
  initialValue: T,
  validator?: (value: T, ...args: any[]) => ValidationResult
) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const validate = useCallback(
    (newValue: T, ...args: any[]) => {
      if (!validator) return true;
      
      const result = validator(newValue, ...args);
      setError(result.isValid ? undefined : result.error);
      return result.isValid;
    },
    [validator]
  );

  const handleChange = useCallback(
    (newValue: T, ...args: any[]) => {
      setValue(newValue);
      if (touched) {
        validate(newValue, ...args);
      }
    },
    [touched, validate]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    validate(value);
  }, [value, validate]);

  return {
    value,
    error: touched ? error : undefined,
    setValue: handleChange,
    onBlur: handleBlur,
    isValid: !error || !touched,
    touched,
  };
}
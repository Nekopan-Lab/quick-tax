export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validatePositiveNumber(value: number, fieldName: string): ValidationResult {
  if (value < 0) {
    return {
      isValid: false,
      error: `${fieldName} must be a positive number`,
    };
  }
  return { isValid: true };
}

export function validateQualifiedDividends(qualified: number, ordinary: number): ValidationResult {
  if (qualified > ordinary) {
    return {
      isValid: false,
      error: 'Qualified dividends cannot exceed ordinary dividends',
    };
  }
  return { isValid: true };
}

export function validateDate(dateString: string, fieldName: string): ValidationResult {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid date`,
    };
  }
  return { isValid: true };
}

export function validateFutureDate(dateString: string, fieldName: string): ValidationResult {
  const dateValidation = validateDate(dateString, fieldName);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return {
      isValid: false,
      error: `${fieldName} must be in the future`,
    };
  }
  return { isValid: true };
}

export function validateStockPrice(price: number): ValidationResult {
  if (price < 0) {
    return {
      isValid: false,
      error: 'Stock price must be positive',
    };
  }
  if (price > 10000) {
    return {
      isValid: false,
      error: 'Stock price seems unreasonably high (> $10,000)',
    };
  }
  return { isValid: true };
}

export function validateTaxPayment(payment: number, quarter: string): ValidationResult {
  if (payment < 0) {
    return {
      isValid: false,
      error: `${quarter} payment cannot be negative`,
    };
  }
  if (payment > 1000000) {
    return {
      isValid: false,
      error: `${quarter} payment seems unreasonably high (> $1,000,000)`,
    };
  }
  return { isValid: true };
}

export function validateIncome(income: number, fieldName: string): ValidationResult {
  if (income < -1000000) {
    return {
      isValid: false,
      error: `${fieldName} loss seems unreasonably large (< -$1,000,000)`,
    };
  }
  if (income > 100000000) {
    return {
      isValid: false,
      error: `${fieldName} seems unreasonably high (> $100,000,000)`,
    };
  }
  return { isValid: true };
}
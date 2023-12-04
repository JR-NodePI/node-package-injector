import {
  ValidationResult,
  ValidationRule,
  ValidationValue,
} from './FormValidationTypes';

export default class ValidationRules {
  public static required(
    errorMessage = 'This field is required'
  ): ValidationRule {
    return async (value: ValidationValue): Promise<ValidationResult> => {
      if (value === undefined || value === null || value === '') {
        return {
          isValid: false,
          error: errorMessage,
        };
      }

      return { isValid: true, error: '' };
    };
  }
}

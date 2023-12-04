import type { Validator } from './ValidatorModel';

export type ValidationValue = undefined | null | string | number | boolean;

export type ValidationResult = {
  isValid: boolean;
  error: string;
};

export type ValidationRule = (
  value: ValidationValue
) => Promise<ValidationResult>;

export type FormValidationContextProps = {
  addValidator?: (validator: Validator) => void;
  removeValidator?: (validator: Validator) => void;
  validate?: () => Promise<boolean>;
  validators?: Validator[];
};

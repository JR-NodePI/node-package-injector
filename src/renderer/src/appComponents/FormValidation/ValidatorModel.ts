import {
  ValidationResult,
  ValidationRule,
  ValidationValue,
} from './FormValidationTypes';

export default class Validator {
  private _id = crypto.randomUUID();
  private _validationResults: ValidationResult[] = [];

  public get id(): string {
    return this._id;
  }

  private _rules: ValidationRule[] = [];
  public get rules(): ValidationRule[] {
    return this._rules;
  }

  public value: ValidationValue;

  constructor(rules: ValidationRule[]) {
    this._rules = rules;
  }

  public get isValid(): boolean {
    return this._validationResults.some(result => !result.isValid);
  }

  public get errors(): string[] {
    return this._validationResults
      .filter(result => !result.isValid)
      .map(result => result.error);
  }

  private _onValidateEvent?: (validator: Validator) => void;
  private _onResetEvent?: (validator: Validator) => void;

  public async validate(): Promise<boolean> {
    let isValid = true;

    this._validationResults = [];

    for (const rule of this._rules) {
      const result = await rule(this.value);

      this._validationResults.push(result);

      if (!result.isValid) {
        isValid = false;
      }
    }

    if (this._onValidateEvent) {
      this._onValidateEvent(this);
      this._onValidateEvent = undefined;
    }

    return isValid;
  }

  public reset(): void {
    this._validationResults = [];
    if (this._onResetEvent) {
      this._onResetEvent(this);
      this._onResetEvent = undefined;
    }
  }

  public set onValidate(callback: (validator: Validator) => void) {
    this._onValidateEvent = callback;
  }

  public set onReset(callback: (validator: Validator) => void) {
    this._onResetEvent = callback;
  }
}

import React, { useState } from 'react';

import { c } from 'fratch-ui/helpers';

import type { ValidationRule, ValidationValue } from './FormValidationTypes';
import useSetFormValidator from './useSetFormValidator';

import styles from './FormValidation.module.css';

const FormValidationField: React.FC<{
  rules: ValidationRule[];
  children: React.ReactElement;
}> = ({ rules, children }) => {
  const childrenRef = React.useRef<{ value: ValidationValue }>(null);
  const value = childrenRef.current?.value;

  const validator = useSetFormValidator({ rules, value });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  validator.onReset = (): void => {
    setValidationErrors([]);
  };
  validator.onValidate = ({ errors }): void => {
    setValidationErrors(errors);
  };

  const hasError = validationErrors.length > 0;

  return (
    <div className={c(styles.wrapper, hasError ? styles.error : '')}>
      {React.cloneElement(React.Children.only(children), { ref: childrenRef })}
      {hasError && (
        <label className={c(styles.error_message)}>
          {validator.errors.join('; ')}
        </label>
      )}
    </div>
  );
};

export default FormValidationField;

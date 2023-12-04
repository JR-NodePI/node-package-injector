import { useContext, useEffect, useRef } from 'react';

import FormValidationContext from './FormValidationContext';
import type { ValidationRule, ValidationValue } from './FormValidationTypes';
import Validator from './ValidatorModel';

export default function useSetFormValidator({
  rules,
  value,
}: {
  rules: ValidationRule[];
  value: ValidationValue;
}): Validator {
  const { addValidator, removeValidator } = useContext(FormValidationContext);
  const validatorRef = useRef<Validator>(new Validator(rules));

  useEffect(() => {
    addValidator?.(validatorRef.current);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      removeValidator?.(validatorRef.current);
    };
  }, [addValidator, removeValidator]);

  useEffect(() => {
    if (validatorRef.current) {
      validatorRef.current.reset();
      validatorRef.current.value = value;
    }
  }, [value]);

  return validatorRef.current;
}

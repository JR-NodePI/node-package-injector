import { useCallback, useMemo, useState } from 'react';

import FormValidationContext from './FormValidationContext';
import type { FormValidationContextProps } from './FormValidationTypes';
import Validator from './ValidatorModel';

export default function FormValidationProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [validators, setValidators] = useState<Map<string, Validator>>(
    new Map()
  );

  const addValidator = useCallback((validator: Validator): void => {
    setValidators(validators => {
      validators.set(validator.id, validator);
      return new Map(validators);
    });
  }, []);

  const removeValidator = useCallback((validator: Validator): void => {
    setValidators(validators => {
      validators.delete(validator.id);
      return new Map(validators);
    });
  }, []);

  const validate = useCallback(async (): Promise<boolean> => {
    let isAllValid = true;

    for (const validator of validators.values()) {
      const isValid = await validator.validate();
      if (!isValid) {
        isAllValid = false;
      }
    }

    return isAllValid;
  }, [validators]);

  const providerValue =
    useMemo<FormValidationContextProps>((): FormValidationContextProps => {
      return { addValidator, removeValidator, validate };
    }, [addValidator, removeValidator, validate]);

  return (
    <FormValidationContext.Provider value={providerValue}>
      {children}
    </FormValidationContext.Provider>
  );
}

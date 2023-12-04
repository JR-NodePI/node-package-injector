import { useContext } from 'react';

import FormValidationContext from './FormValidationContext';
import { FormValidationContextProps } from './FormValidationTypes';

export default function useFormValidation(): Pick<
  FormValidationContextProps,
  'validate' | 'validators'
> {
  const { validate, validators } = useContext(FormValidationContext);
  return { validate, validators };
}

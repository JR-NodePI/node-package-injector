import { useContext } from 'react';

import FormValidationContext, {
  type FormValidationProps,
} from './FormValidationContext';

export type useFormValidationProps = {
  rules: Array<(value?: unknown) => boolean>;
  value?: unknown;
};

export default function useFormValidation({
  rules,
  value,
}: useFormValidationProps): { errors: string[] } {
  const { addValidator } = useContext(FormValidationContext);
  console.log('>>>----->> ', rules, value);
  return { errors: ['Error'] };
}

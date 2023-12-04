import { useMemo } from 'react';

import FormValidationContext, {
  FormValidationProps,
} from './FormValidationContext';

export default function FormValidationProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const providerValue =
    useMemo<FormValidationProps>((): FormValidationProps => {
      return {};
    }, []);

  return (
    <FormValidationContext.Provider value={providerValue}>
      {children}
    </FormValidationContext.Provider>
  );
}

import React from 'react';

import type { FormValidationContextProps } from './FormValidationTypes';

const FormValidationContext = React.createContext<FormValidationContextProps>(
  {}
);

export default FormValidationContext;

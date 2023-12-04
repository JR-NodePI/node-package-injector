import React from 'react';

export type FormValidationProps = {
  addValidator?: (() => void) => void;
};

const FormValidationContext = React.createContext<FormValidationProps>({});

export default FormValidationContext;

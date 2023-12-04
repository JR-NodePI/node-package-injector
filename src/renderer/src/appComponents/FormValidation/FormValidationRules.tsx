import React from 'react';

import { c } from 'fratch-ui/helpers';

import useFormValidation, { useFormValidationProps } from './useFormValidation';

import styles from './FormValidation.module.css';

const FormValidationRules: React.FC<{
  rules: useFormValidationProps['rules'];
  children: React.ReactElement;
}> = ({ rules, children }) => {
  const ref = React.useRef<{ value: unknown }>(null);

  useFormValidation({ rules, value: ref.current?.value });

  return (
    <div className={c(styles.wrapper)}>
      {React.cloneElement(React.Children.only(children), { ref })}
      <label className={c(styles.error)}>
        Target sub-directory is required
      </label>
    </div>
  );
};

export default FormValidationRules;

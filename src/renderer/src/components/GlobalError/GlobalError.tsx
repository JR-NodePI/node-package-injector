import { type ReactNode } from 'react';

import { c } from 'fratch-ui/helpers/classNameHelpers';

import DevToolsOpener from './DevToolsOpener';

import styles from './GlobalError.module.css';

export default function GlobalError({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className={c(styles.global_error)}>
      {children}
      <DevToolsOpener />
    </div>
  );
}

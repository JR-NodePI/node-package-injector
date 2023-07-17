import { c } from 'fratch-ui/helpers/classNameHelpers';
import { type ReactNode } from 'react';

import styles from './GlobalError.module.css';
import DevToolsOpener from './DevToolsOpener';

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

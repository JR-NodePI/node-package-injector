import { type ReactNode } from 'react';

import { c } from 'fratch-ui/helpers/classNameHelpers';

import styles from './Footer.module.css';

function Footer({ children }: { children: ReactNode }): JSX.Element {
  return (
    <>
      <footer className={c(styles.footer)}>
        <p className={c(styles.version)}>
          version: {window.api.PACKAGE_VERSION}
        </p>
        {children}
      </footer>
    </>
  );
}

export default Footer;

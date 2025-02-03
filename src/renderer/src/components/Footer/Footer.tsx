import { type ReactNode } from 'react';

import { c } from 'fratch-ui/helpers';

import styles from './Footer.module.css';

function Footer({ children }: { children: ReactNode }): JSX.Element {
  return (
    <>
      <footer className={c(styles.footer)}>
        <p className={c(styles.version)}>
          {import.meta.env.DEV ? '<<<DEV>>> ' : ''}
          version: {import.meta.env.PACKAGE_VERSION}
        </p>
        {children}
      </footer>
    </>
  );
}

export default Footer;

import { type ReactNode, useEffect, useState } from 'react';

import { c } from 'fratch-ui/helpers/classNameHelpers';

import styles from './Footer.module.css';

function Footer({ children }: { children: ReactNode }): JSX.Element {
  const [version, setVersion] = useState('');

  useEffect(() => {
    (async (): Promise<void> => {
      setVersion(await window.api.version);
    })();
  }, []);

  return (
    <>
      <footer className={c(styles.footer)}>
        <p className={c(styles.version)}>version: {version}</p>
        {children}
      </footer>
    </>
  );
}

export default Footer;

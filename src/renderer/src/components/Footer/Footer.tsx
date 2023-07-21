import { type ReactNode } from 'react';

import { Button } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import styles from './Footer.module.css';

function Footer({ children }: { children: ReactNode }): JSX.Element {
  return (
    <footer className={c(styles.footer)}>
      <Button
        className={c(styles.close_button)}
        label="Quit"
        onClick={async (): Promise<void> => {
          await window.electron.ipcRenderer.invoke('quit');
        }}
      />
      {children}
    </footer>
  );
}

export default Footer;

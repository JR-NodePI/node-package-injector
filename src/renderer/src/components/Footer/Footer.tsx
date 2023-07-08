import { c } from 'fratch-ui/helpers/classNameHelpers';
import { Button } from 'fratch-ui';

import styles from './Footer.module.css';

function Footer({ isValidNode }: { isValidNode: boolean }): JSX.Element {
  return (
    <footer className={c(styles.footer)}>
      <Button
        className={c(styles.closeButton)}
        label="Quit"
        onClick={async (): Promise<void> => {
          await window.electron.ipcRenderer.invoke('quit');
        }}
      />
      {isValidNode && (
        <>
          <Button label="Run" type="primary" />
          <Button label="Stop" type="secondary" />
        </>
      )}
    </footer>
  );
}

export default Footer;

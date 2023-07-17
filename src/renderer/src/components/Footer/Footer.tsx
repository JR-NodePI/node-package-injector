import { c } from 'fratch-ui/helpers/classNameHelpers';
import { Button } from 'fratch-ui';
import useCheckTerminal from '../CheckTerminalProvider/useCheckTerminal';

import styles from './Footer.module.css';

function Footer(): JSX.Element {
  const { loadingTerminal, isValidTerminal } = useCheckTerminal();

  return (
    <footer className={c(styles.footer)}>
      <Button
        className={c(styles.closeButton)}
        label="Quit"
        onClick={async (): Promise<void> => {
          await window.electron.ipcRenderer.invoke('quit');
        }}
      />
      {!loadingTerminal && isValidTerminal && (
        <>
          <Button label="Run" type="primary" />
          <Button label="Stop" type="secondary" />
        </>
      )}
    </footer>
  );
}

export default Footer;

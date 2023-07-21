import { c } from 'fratch-ui/helpers/classNameHelpers';
import { InputCheck } from 'fratch-ui';
import usePersistedState from '@renderer/hooks/usePersistedState';
import { useEffect } from 'react';

export default function OpenDevTools({
  className,
}: {
  className?: string;
}): JSX.Element {
  const [openDevToolsOnInit, setOpenDevToolsOnInit] = usePersistedState(
    'openDevToolsOnInit',
    false
  );

  useEffect(() => {
    if (openDevToolsOnInit) {
      window.electron.ipcRenderer.send('devTools');
    }
  }, [openDevToolsOnInit]);

  const handleWSLChange = (): void => {
    setOpenDevToolsOnInit(!openDevToolsOnInit);
  };

  return (
    <>
      <InputCheck
        ref={(current: HTMLInputElement): void => {
          if (current) {
            current.checked = openDevToolsOnInit;
            current.blur();
          }
        }}
        className={c(className)}
        checked={openDevToolsOnInit}
        label="open dev tools"
        onChange={handleWSLChange}
      />
    </>
  );
}

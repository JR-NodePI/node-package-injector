import { useEffect } from 'react';

import usePersistedState from '@renderer/components/GlobalDataProvider/hooks/usePersistedState';
import { InputCheck } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

export default function OpenDevTools({
  className,
  onChange,
}: {
  className?: string;
  onChange?: (checked: boolean) => void;
}): JSX.Element {
  const [openDevTools, setOpenDevTools] = usePersistedState(
    'openDevTools',
    false
  );

  useEffect(() => {
    if (openDevTools) {
      window.electron.ipcRenderer.send('openDevTools');
    } else {
      window.electron.ipcRenderer.send('closeDevTools');
    }
  }, [openDevTools]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = event.target.checked ?? false;
    setOpenDevTools(checked);
    onChange?.(checked);
  };

  const handleRef = (current: HTMLInputElement): void => {
    if (current) {
      current.checked = openDevTools;
    }
  };

  return (
    <>
      <InputCheck
        ref={handleRef}
        className={c(className)}
        label="open dev tools"
        onChange={handleChange}
        position="right"
      />
    </>
  );
}

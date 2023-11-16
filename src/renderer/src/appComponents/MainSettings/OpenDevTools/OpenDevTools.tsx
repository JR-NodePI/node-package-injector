import { useEffect } from 'react';

import usePersistedState from '@renderer/appComponents/GlobalDataProvider/usePersistedState';
import { InputCheck } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

export default function OpenDevTools({
  className,
}: {
  className?: string;
}): JSX.Element {
  const [openDevTools, setOpenDevTools, loading] = usePersistedState(
    'openDevTools',
    false
  );

  useEffect(() => {
    if (openDevTools) {
      window.electron.ipcRenderer.send('open-dev-tools');
    } else {
      window.electron.ipcRenderer.send('close-dev-tools');
    }
  }, [openDevTools]);

  const handleChange = (checked): void => {
    setOpenDevTools(checked);
  };

  if (loading) {
    return <></>;
  }

  return (
    <InputCheck
      checked={openDevTools}
      className={c(className)}
      label="open dev tools"
      onChange={handleChange}
      position="right"
    />
  );
}

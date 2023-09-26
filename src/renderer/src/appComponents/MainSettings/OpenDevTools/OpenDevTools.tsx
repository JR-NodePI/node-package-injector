import { useEffect } from 'react';

import usePersistedState from '@renderer/appComponents/GlobalDataProvider/usePersistedState';
import { Form } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

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
      window.electron.ipcRenderer.send('openDevTools');
    } else {
      window.electron.ipcRenderer.send('closeDevTools');
    }
  }, [openDevTools]);

  const handleChange = (checked): void => {
    setOpenDevTools(checked);
  };

  if (loading) {
    return <></>;
  }

  return (
    <Form.InputCheck
      checked={openDevTools}
      className={c(className)}
      label="open dev tools"
      onChange={handleChange}
      position="right"
    />
  );
}

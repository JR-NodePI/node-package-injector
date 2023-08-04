import { useEffect } from 'react';

import { Form } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import usePersistedState from '../GlobalDataProvider/usePersistedState';

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = event.target.checked ?? false;
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

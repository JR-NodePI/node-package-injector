import { c } from 'fratch-ui/helpers/classNameHelpers';
import OpenDevTools from '../OpenDevTools/OpenDevTools';
import WSLActivator from '../WSLActivator/WSLActivator';

import styles from './Settings.module.css';
import { useEffect, useState } from 'react';

export default function Settings({
  cwd,
  onWSLActiveChange,
}: {
  cwd?: string;
  onWSLActiveChange: (checked: boolean) => void;
}): JSX.Element {
  const [visible, setVisible] = useState(false);

  const handleOnClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    setVisible(true);
  };

  const handleOnClickInside = (event: React.MouseEvent): void => {
    event.stopPropagation();
  };

  useEffect(() => {
    const handleOnClickOutside = (event: MouseEvent): void => {
      event.preventDefault();
      setVisible(false);
    };
    window.addEventListener('click', handleOnClickOutside);

    return () => {
      window.removeEventListener('click', handleOnClickOutside);
    };
  }, []);

  return (
    <div className={c(styles.settings)} onClick={handleOnClickInside}>
      <a href="#" onClick={handleOnClick} className={c(styles.opener)}>
        ⋮
      </a>
      <ul className={c(styles.menu, visible ? styles.open : styles.close)}>
        <li>
          <OpenDevTools />
        </li>
        <li>
          <WSLActivator cwd={cwd} onChange={onWSLActiveChange} />
        </li>
      </ul>
    </div>
  );
}

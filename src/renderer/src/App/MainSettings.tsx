import TerminalService from '@renderer/services/TerminalService';
import { SettingsMenu } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import OpenDevTools from './OpenDevTools';
import WSLActivator from './WSLActivator';

export default function MainSettings({
  cwd,
  onWSLActiveChange,
  className,
}: {
  cwd?: string;
  onWSLActiveChange: (active: boolean) => void;
  className?: string;
}): JSX.Element {
  const settingsItems: JSX.Element[] = [];

  settingsItems.push(<OpenDevTools />);

  if (TerminalService.isWSLAvailable) {
    settingsItems.push(<WSLActivator cwd={cwd} onChange={onWSLActiveChange} />);
  }
  return (
    <SettingsMenu
      className={c(className)}
      items={settingsItems}
      position="right"
    />
  );
}

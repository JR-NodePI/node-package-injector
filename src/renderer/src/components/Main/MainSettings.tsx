import TerminalService from '@renderer/services/TerminalService';
import { SettingsMenu } from 'fratch-ui';

import OpenDevTools from '../OpenDevTools/OpenDevTools';
import WSLActivator from '../WSLActivator/WSLActivator';

export default function MainSettings({
  cwd,
  onWSLActiveChange,
}: {
  cwd?: string;
  onWSLActiveChange: (active: boolean) => void;
}): JSX.Element {
  const settingsItems: JSX.Element[] = [];

  settingsItems.push(<OpenDevTools />);

  if (TerminalService.isWSLAvailable) {
    settingsItems.push(<WSLActivator cwd={cwd} onChange={onWSLActiveChange} />);
  }
  return <SettingsMenu items={settingsItems} position="right" />;
}

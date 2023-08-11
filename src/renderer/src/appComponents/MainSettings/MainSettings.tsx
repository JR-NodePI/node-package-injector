import TerminalService from '@renderer/services/TerminalService';
import { SettingsMenu } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import ExportImportBunch from './ExportImportBunch/ExportImportBunch';
import NodeInfo from './NodeInfo/NodeInfo';
import OpenDevTools from './OpenDevTools/OpenDevTools';
import WSLActivator from './WSLActivator/WSLActivator';

export default function MainSettings({
  className,
}: {
  className?: string;
}): JSX.Element {
  const settingsItems: JSX.Element[] = [];
  settingsItems.push(<OpenDevTools />);

  if (TerminalService.isWSLAvailable) {
    settingsItems.push(<WSLActivator />);
  }

  settingsItems.push(<ExportImportBunch />);

  settingsItems.push(<NodeInfo />);

  return (
    <SettingsMenu
      className={c(className)}
      items={settingsItems}
      position="right"
    />
  );
}

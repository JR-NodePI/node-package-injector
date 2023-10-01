import TerminalService from '@renderer/services/TerminalService';
import { ColorSchemeSwitcher, SettingsModal } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import AdditionalPackageScripts from '../AdditionalPackageScripts/AdditionalPackageScripts';
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

  settingsItems.push(<ColorSchemeSwitcher />);

  settingsItems.push(<OpenDevTools />);

  if (TerminalService.isWSLAvailable) {
    settingsItems.push(<WSLActivator />);
  }

  settingsItems.push(<ExportImportBunch />);

  settingsItems.push(<AdditionalPackageScripts />);

  settingsItems.push(<NodeInfo />);

  return (
    <SettingsModal
      className={c(className)}
      items={settingsItems}
      position="right"
    />
  );
}

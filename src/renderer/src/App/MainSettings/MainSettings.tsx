import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
import PathService from '@renderer/services/PathService';
import PersistService from '@renderer/services/PersistService';
import TerminalService from '@renderer/services/TerminalService';
import { SettingsMenu } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import useGlobalData from '../GlobalDataProvider/hooks/useGlobalData';
import OpenDevTools from '../OpenDevTools/OpenDevTools';
import WSLActivator from '../WSLActivator/WSLActivator';

export default function MainSettings({
  className,
}: {
  className?: string;
}): JSX.Element {
  const { packageConfigBunches, setPackageConfigBunches } = useGlobalData();

  const settingsItems: JSX.Element[] = [];
  settingsItems.push(<OpenDevTools />);

  if (TerminalService.isWSLAvailable) {
    const activeBunch = packageConfigBunches.find(bunch => bunch.active);
    const activePackageConfig = activeBunch?.packageConfig;

    const handleWSLActiveChange = (setWSL: boolean): void => {
      (async (): Promise<void> => {
        const newBunch = new PackageConfigBunch();
        newBunch.packageConfig = new PackageConfig();
        newBunch.packageConfig.cwd = await PathService.getHomePath(setWSL);
        await PersistService.clear();
        setPackageConfigBunches?.([newBunch]);
      })();
    };

    settingsItems.push(
      <WSLActivator
        cwd={activePackageConfig?.cwd}
        onChange={handleWSLActiveChange}
      />
    );
  }

  return (
    <SettingsMenu
      className={c(className)}
      items={settingsItems}
      position="right"
    />
  );
}

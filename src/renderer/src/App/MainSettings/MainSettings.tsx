import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
import PathService from '@renderer/services/PathService';
import PersistService from '@renderer/services/PersistService';
import TerminalService from '@renderer/services/TerminalService';
import { getTabTitle } from '@renderer/utils';
import { SettingsMenu } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';
import getRandomColor from 'fratch-ui/helpers/getRandomColor';

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
        await PersistService.clear();
        const bunch = new PackageConfigBunch();
        bunch.packageConfig = new PackageConfig();
        bunch.packageConfig.cwd = await PathService.getHomePath(setWSL);
        bunch.active = true;
        bunch.name = getTabTitle(1);
        bunch.color = getRandomColor();
        setPackageConfigBunches?.([bunch]);
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

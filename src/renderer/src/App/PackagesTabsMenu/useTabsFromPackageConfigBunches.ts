import { useEffect, useMemo, useState } from 'react';

import {
  TABS_MAXIMUM_ADDABLE,
  TABS_MINIMUM_REMOVABLE,
} from '@renderer/constants';
import { getTabTitle } from '@renderer/helpers/utilsHelpers';
import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
import PathService from '@renderer/services/PathService';
import {
  type Tab,
  type TabEvent,
  type TabsMenuProps,
} from 'fratch-ui/components/TabsMenu/TabsMenuProps';
import getRandomColor from 'fratch-ui/helpers/getRandomColor';

import useGlobalData from '../GlobalDataProvider/hooks/useGlobalData';

type Props = {
  tabs: Tab[];
  newTabTemplate: TabsMenuProps['newTabTemplate'];
  onTabRemove: (event: TabEvent) => void;
  onTabAdd: (event: TabEvent) => void;
  onTabsChange: (tabs: Tab[]) => void;
  addable?: boolean;
  removable?: boolean;
};

const getDefaultPackageConfigBunch = async (
  isWSLActive?: boolean
): Promise<PackageConfigBunch> => {
  const bunch = new PackageConfigBunch();
  bunch.packageConfig = new PackageConfig();
  bunch.packageConfig.cwd = await PathService.getHomePath(isWSLActive);
  bunch.active = true;
  bunch.name = getTabTitle(1);
  bunch.color = getRandomColor();
  return bunch;
};

export default function useTabsFromPackageConfigBunches(): Props {
  const { isWSLActive, packageConfigBunches, setPackageConfigBunches } =
    useGlobalData();

  const newTabTemplate = useMemo<Props['newTabTemplate']>(() => {
    const excludedColors = packageConfigBunches.map(bunch => bunch.color);
    return {
      label: getTabTitle(packageConfigBunches.length + 1),
      color: getRandomColor(excludedColors),
    };
  }, [packageConfigBunches]);

  const [tabs, setTabs] = useState<Tab[]>(
    packageConfigBunches.map(bunch => ({
      label: bunch.name,
      active: bunch.active,
      color: bunch.color,
    }))
  );

  // fill with one bunch and one tab if the list of bunches is empty
  useEffect(() => {
    if (!packageConfigBunches.length) {
      (async (): Promise<void> => {
        const newBunch = await getDefaultPackageConfigBunch(isWSLActive);
        setPackageConfigBunches?.([newBunch]);

        const tab = {
          label: newBunch.name,
          active: newBunch.active,
          color: newBunch.color,
        };
        setTabs([tab]);
      })();
    }
  }, [isWSLActive, packageConfigBunches]);

  const onTabRemove = ({ index }: TabEvent): void => {
    setPackageConfigBunches?.(
      packageConfigBunches.filter((_bunch, i) => i !== index)
    );
  };

  const onTabAdd = ({ label, color }: TabEvent): void => {
    (async (): Promise<void> => {
      const newBunch = await getDefaultPackageConfigBunch(isWSLActive);
      newBunch.active = true;
      newBunch.color = color;
      newBunch.name = label;

      const newBunches = [
        ...(packageConfigBunches ?? []).map(bunch => {
          const clone = bunch.clone();
          clone.active = false;
          return clone;
        }),
        newBunch,
      ];

      setPackageConfigBunches?.(newBunches);
    })();
  };

  const onTabsChange = (newTabs: Tab[]): void => {
    if (newTabs.length !== packageConfigBunches.length) {
      return;
    }
    setPackageConfigBunches?.([
      ...packageConfigBunches.map((bunch, index) => {
        const tab = newTabs[index];
        const clone = bunch.clone();
        clone.active = tab.active ?? false;
        clone.name = tab.label;
        return clone;
      }),
    ]);
  };

  return {
    tabs,
    newTabTemplate,
    onTabRemove,
    onTabAdd,
    onTabsChange,
    addable: packageConfigBunches.length < TABS_MAXIMUM_ADDABLE,
    removable: packageConfigBunches.length > TABS_MINIMUM_REMOVABLE,
  };
}

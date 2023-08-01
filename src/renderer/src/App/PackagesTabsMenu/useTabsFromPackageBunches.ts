import { useEffect, useMemo, useState } from 'react';

import {
  TABS_MAXIMUM_ADDABLE,
  TABS_MINIMUM_REMOVABLE,
} from '@renderer/constants';
import { getTabTitle } from '@renderer/helpers/utilsHelpers';
import PackageBunch from '@renderer/models/PackageBunch';
import TargetPackage from '@renderer/models/TargetPackage';
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

const getDefaultPackageBunch = async (
  isWSLActive?: boolean
): Promise<PackageBunch> => {
  const bunch = new PackageBunch();
  bunch.targetPackage = new TargetPackage();
  bunch.targetPackage.cwd = await PathService.getHomePath(isWSLActive);
  bunch.active = true;
  bunch.name = getTabTitle(1);
  bunch.color = getRandomColor();
  return bunch;
};

export default function useTabsFromPackageBunches(): Props {
  const { isWSLActive, packageBunches, setPackageBunch } = useGlobalData();

  const newTabTemplate = useMemo<Props['newTabTemplate']>(() => {
    const excludedColors = packageBunches.map(bunch => bunch.color);
    return {
      label: getTabTitle(packageBunches.length + 1),
      color: getRandomColor(excludedColors),
    };
  }, [packageBunches]);

  const [tabs, setTabs] = useState<Tab[]>(
    packageBunches.map(bunch => ({
      label: bunch.name,
      active: bunch.active,
      color: bunch.color,
    }))
  );

  // fill with one bunch and one tab if the list of bunches is empty
  useEffect(() => {
    if (!packageBunches.length) {
      (async (): Promise<void> => {
        const newBunch = await getDefaultPackageBunch(isWSLActive);
        setPackageBunch?.([newBunch]);

        const tab = {
          label: newBunch.name,
          active: newBunch.active,
          color: newBunch.color,
        };
        setTabs([tab]);
      })();
    }
  }, [isWSLActive, packageBunches]);

  const onTabRemove = ({ index }: TabEvent): void => {
    setPackageBunch?.(packageBunches.filter((_bunch, i) => i !== index));
  };

  const onTabAdd = ({ label, color }: TabEvent): void => {
    (async (): Promise<void> => {
      const newBunch = await getDefaultPackageBunch(isWSLActive);
      newBunch.active = true;
      newBunch.color = color;
      newBunch.name = label;

      const newBunches = [
        ...(packageBunches ?? []).map(bunch => {
          const clone = bunch.clone();
          clone.active = false;
          return clone;
        }),
        newBunch,
      ];

      setPackageBunch?.(newBunches);
    })();
  };

  const onTabsChange = (newTabs: Tab[]): void => {
    if (newTabs.length !== packageBunches.length) {
      return;
    }
    setPackageBunch?.([
      ...packageBunches.map((bunch, index) => {
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
    addable: packageBunches.length < TABS_MAXIMUM_ADDABLE,
    removable: packageBunches.length > TABS_MINIMUM_REMOVABLE,
  };
}

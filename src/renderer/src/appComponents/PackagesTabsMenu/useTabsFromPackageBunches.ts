import { useEffect, useState } from 'react';

import {
  type Tab,
  type TabEvent,
  type TabsMenuProps,
} from 'fratch-ui/components/TabsMenu/TabsMenuProps';
import getRandomColor from 'fratch-ui/randomColors/getRandomColor';
import useDeepCompareEffect from 'use-deep-compare-effect';

import {
  TABS_MAXIMUM_ADDABLE,
  TABS_MINIMUM_REMOVABLE,
} from '@renderer/constants';
import { getTabTitle } from '@renderer/helpers/utilsHelpers';
import NodePackage from '@renderer/models/NodePackage';
import PackageBunch from '@renderer/models/PackageBunch';
import PathService from '@renderer/services/PathService';

import useGlobalData from '../GlobalDataProvider/useGlobalData';

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
  bunch.targetPackage = new NodePackage();
  bunch.targetPackage.cwd = await PathService.getHomePath(isWSLActive);
  bunch.active = true;
  bunch.name = getTabTitle(1);
  bunch.color = getRandomColor();
  return bunch;
};

export default function useTabsFromPackageBunches(): Props {
  const { isWSLActive, packageBunches, setPackageBunches } = useGlobalData();

  // fill with one bunch and one tab if the list of bunches is empty
  useEffect(() => {
    if (!packageBunches.length) {
      (async (): Promise<void> => {
        const newBunch = await getDefaultPackageBunch(isWSLActive);
        setPackageBunches?.([newBunch]);
      })();
    }
  }, [isWSLActive, packageBunches, setPackageBunches]);

  const [tabs, setTabs] = useState<Tab[]>([]);

  const newTabs = packageBunches.map(bunch => ({
    label: bunch.name,
    active: bunch.active,
    color: bunch.color,
  }));

  // set tabs when packageBunches change
  useDeepCompareEffect(() => {
    setTabs(newTabs);
  }, [newTabs]);

  const onTabRemove = ({ index }: TabEvent): void => {
    setPackageBunches?.(packageBunches.filter((_bunch, i) => i !== index));
  };

  const onTabAdd = ({ label, color }: TabEvent): void => {
    (async (): Promise<void> => {
      const newBunch = await getDefaultPackageBunch(isWSLActive);
      newBunch.active = true;
      newBunch.color = color;
      newBunch.name = label;

      const newBunches = [
        ...(packageBunches ?? []).map(bunch => {
          const clonedBunch = bunch.clone();
          clonedBunch.active = false;
          return clonedBunch;
        }),
        newBunch,
      ];

      setPackageBunches?.(newBunches);
    })();
  };

  const onTabsChange = (newTabs: Tab[]): void => {
    if (newTabs.length !== packageBunches.length) {
      return;
    }
    setPackageBunches?.([
      ...packageBunches.map((bunch, index) => {
        const tab = newTabs[index];
        bunch.active = tab.active ?? false;
        bunch.name = tab.label;
        return bunch;
      }),
    ]);
  };

  const excludedColors = newTabs.map(tab => tab.color);
  const newTabTemplate = {
    label: getTabTitle(newTabs.length + 1),
    color: getRandomColor(excludedColors),
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

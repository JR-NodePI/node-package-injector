import { useEffect, useMemo, useState } from 'react';

import {
  TABS_MAXIMUM_ADDABLE,
  TABS_MINIMUM_REMOVABLE,
} from '@renderer/constants';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
import { getTabTitle } from '@renderer/helpers/utilsHelpers';
import { Tab } from 'fratch-ui/components/TabsMenu/TabsMenuProps';
import getRandomColor from 'fratch-ui/helpers/getRandomColor';

import useGlobalData from '../GlobalDataProvider/hooks/useGlobalData';

type TabEvent = Pick<Tab, 'label'> & {
  index: number;
};

type Props = {
  tabs: Tab[];
  newTabTemplate: Pick<Tab, 'color' | 'label' | 'Icon'>;
  onTabRemove: (event: TabEvent) => void;
  onTabAdd: (event: TabEvent) => void;
  onTabsChange: (tabs: Tab[]) => void;
  addable?: boolean;
  removable?: boolean;
};

export default function useTabsFromPackageConfigBunches(): Props {
  const {
    isWSLActive,
    packageConfigBunches,
    setPackageConfigBunches,
    defaultPackageConfig,
  } = useGlobalData();

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

  const [initialActiveWSL, setInitialActiveWSL] = useState<boolean>();
  useEffect(() => {
    if (initialActiveWSL !== isWSLActive) {
      setTabs(
        packageConfigBunches.map(bunch => ({
          label: bunch.name,
          active: bunch.active,
          color: bunch.color,
        }))
      );
      setInitialActiveWSL(isWSLActive);
    }
  }, [isWSLActive, initialActiveWSL, packageConfigBunches]);

  const onTabRemove = ({ index }: TabEvent): void => {
    setPackageConfigBunches?.(
      packageConfigBunches.filter((_bunch, i) => i !== index)
    );
  };

  const onTabAdd = ({ label }: TabEvent): void => {
    const newBunch = new PackageConfigBunch();
    newBunch.name = label;
    newBunch.packageConfig = defaultPackageConfig.clone();

    newBunch.active = true;
    newBunch.color = newTabTemplate.color;

    setPackageConfigBunches?.([
      ...(packageConfigBunches ?? []).map(bunch => {
        const clone = bunch.clone();
        clone.active = false;

        return clone;
      }),
      newBunch,
    ]);
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

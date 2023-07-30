import { useMemo } from 'react';

import {
  TABS_MAXIMUM_ADDABLE,
  TABS_MINIMUM_REMOVABLE,
} from '@renderer/constants';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
import { getTabTitle } from '@renderer/utils';
import { TabsMenu } from 'fratch-ui';
import { type Tab } from 'fratch-ui/components/TabsMenu/TabsMenuProps';
import { c } from 'fratch-ui/helpers/classNameHelpers';
import getRandomColor from 'fratch-ui/helpers/getRandomColor';

import useGlobalData from '../GlobalDataProvider/hooks/useGlobalData';

import styles from './PackagesTabsMenu.module.css';

type TabEvent = Pick<Tab, 'label'> & {
  index: number;
};

export default function PackagesTabsMenu(): JSX.Element {
  const {
    packageConfigBunches,
    setPackageConfigBunches,
    defaultPackageConfig,
  } = useGlobalData();

  const newTabTemplate = useMemo(() => {
    const excludedColors = packageConfigBunches.map(bunch => bunch.color);
    return {
      label: getTabTitle(packageConfigBunches.length + 1),
      color: getRandomColor(excludedColors),
    };
  }, [packageConfigBunches]);

  const tabs = packageConfigBunches.map(bunch => {
    return { label: bunch.name, active: bunch.active, color: bunch.color };
  });

  const handleTabRemove = ({ index }: TabEvent): void => {
    setPackageConfigBunches?.(
      packageConfigBunches.filter((_bunch, i) => i !== index)
    );
  };

  const handleTabAdd = ({ label }: TabEvent): void => {
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

  const handleTabsChange = (newTabs: Tab[]): void => {
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

  return (
    <TabsMenu
      newTabTemplate={newTabTemplate}
      className={c(styles.tabs_menu)}
      editable
      addable={packageConfigBunches.length < TABS_MAXIMUM_ADDABLE}
      removable={packageConfigBunches.length > TABS_MINIMUM_REMOVABLE}
      onTabAdd={handleTabAdd}
      onTabRemove={handleTabRemove}
      onTabsChange={handleTabsChange}
      tabs={tabs}
    />
  );
}

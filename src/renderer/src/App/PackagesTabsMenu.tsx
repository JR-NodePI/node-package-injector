import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
import { TabsMenu } from 'fratch-ui';
import { type Tab } from 'fratch-ui/components/TabsMenu/TabsMenuProps';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import useGlobalData from './GlobalDataProvider/useGlobalData';

import styles from './Main.module.css';

type TabEvent = Pick<Tab, 'label'> & {
  index: number;
};

export default function PackagesTabsMenu(): JSX.Element {
  const { packageConfigBunches, setPackageConfigBunches } = useGlobalData();

  const tabs = packageConfigBunches.map(bunch => {
    return { label: bunch.name, active: bunch.active };
  });

  const handleTabRemove = ({ index }: TabEvent): void => {
    setPackageConfigBunches?.(
      packageConfigBunches.filter((_bunch, i) => i !== index)
    );
  };

  const handleTabClick = ({ index }: TabEvent): void => {
    setPackageConfigBunches?.([
      ...packageConfigBunches.map((bunch, i) => {
        const clone = bunch.clone();
        clone.active = i === index;
        return clone;
      }),
    ]);
  };

  const handleTabEdit = ({ label, index }: TabEvent): void => {
    setPackageConfigBunches?.(
      packageConfigBunches.map((bunch, i) => {
        const clone = bunch.clone();
        if (i === index) {
          clone.name = label;
        }
        return clone;
      })
    );
  };

  const handleTabAdd = ({ label }: TabEvent): void => {
    const newBunch = new PackageConfigBunch();
    newBunch.packageConfig = new PackageConfig();
    newBunch.name = label || newBunch.packageConfig.id;
    newBunch.active = true;
    setPackageConfigBunches?.([
      ...(packageConfigBunches ?? []).map(bunch => {
        const clone = bunch.clone();
        clone.active = false;
        return clone;
      }),
      newBunch,
    ]);
  };

  // const handleTabsChange = (newTabs: Tab[]): void => {
  //   console.log('>>>----->> newTabs', newTabs);
  // };

  return (
    <TabsMenu
      className={c(styles.tabs_menu)}
      editable
      onTabAdd={handleTabAdd}
      onTabClick={handleTabClick}
      onTabEdit={handleTabEdit}
      onTabRemove={handleTabRemove}
      // onTabsChange={handleTabsChange}
      tabs={tabs}
    />
  );
}

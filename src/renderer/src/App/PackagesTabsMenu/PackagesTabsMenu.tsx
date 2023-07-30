import { TabsMenu } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import useTabsFromPackageConfigBunches from './useTabsFromPackageConfigBunches';

import styles from './PackagesTabsMenu.module.css';

export default function PackagesTabsMenu(): JSX.Element {
  const {
    addable,
    newTabTemplate,
    onTabAdd,
    onTabRemove,
    onTabsChange,
    removable,
    tabs,
  } = useTabsFromPackageConfigBunches();

  return (
    <TabsMenu
      newTabTemplate={newTabTemplate}
      className={c(styles.tabs_menu)}
      editable
      addable={addable}
      removable={removable}
      onTabAdd={onTabAdd}
      onTabRemove={onTabRemove}
      onTabsChange={onTabsChange}
      tabs={tabs}
    />
  );
}

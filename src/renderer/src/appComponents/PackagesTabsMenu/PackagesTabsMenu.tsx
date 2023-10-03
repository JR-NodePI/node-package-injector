import { TabsMenu } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import useTabsFromPackageBunches from './useTabsFromPackageBunches';

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
  } = useTabsFromPackageBunches();

  const witAppHeader = window.electron.process.platform !== 'linux';

  return (
    <TabsMenu
      newTabTemplate={newTabTemplate}
      className={c(styles.tabs_menu, witAppHeader ? styles.with_header : '')}
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

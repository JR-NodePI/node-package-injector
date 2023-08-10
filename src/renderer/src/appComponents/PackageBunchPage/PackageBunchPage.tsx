import { c } from 'fratch-ui/helpers/classNameHelpers';

import useGlobalData from '../GlobalDataProvider/useGlobalData';
import Dependencies from './Dependencies/Dependencies';
import TargetPackageSelector from './TargetPackageSelector';

import styles from './PackageBunchPage.module.css';

export default function PackageBunchPage(): JSX.Element {
  const { activePackageBunch } = useGlobalData();

  return (
    <>
      <h1 className={c(styles.title)}>
        Target
        <span className={c(styles.badge)}>
          <span
            className={c(styles.dot_color)}
            style={{ background: activePackageBunch.color }}
          />
          {activePackageBunch.name}
        </span>
      </h1>
      <TargetPackageSelector key={`${activePackageBunch.id}-pkg`} />
      <Dependencies key={`${activePackageBunch.id}-deps`} />
    </>
  );
}

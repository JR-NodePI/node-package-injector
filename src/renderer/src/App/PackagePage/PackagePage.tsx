import DependencyPackage from '@renderer/models/DependencyPackage';
import { type PackageInstallModeValue } from '@renderer/models/PackageInstallMode';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import Dependencies from '../Dependencies/Dependencies';
import useGlobalData from '../GlobalDataProvider/hooks/useGlobalData';
import PackageSelector from '../PackageSelector/PackageSelector';

import styles from './PackagePage.module.css';

export default function PackagePage(): JSX.Element {
  const {
    packageBunches,
    activePackageBunch,
    setActiveTargetPackage,
    setActiveDependencies,
  } = useGlobalData();
  const activeBunch = packageBunches.find(bunch => bunch.active);
  const activeTargetPackage = activeBunch?.targetPackage;
  const activeDependencies = activeBunch?.dependencies;

  const handlePathChange = (cwd: string, isValidPackage): void => {
    const targetPackage = activeTargetPackage?.clone();
    if (targetPackage) {
      targetPackage.cwd = cwd;
      targetPackage.isValidPackage = isValidPackage;
      setActiveTargetPackage?.(targetPackage);
    }
  };

  const handleGitPullChange = (checked?: boolean): void => {
    const targetPackage = activeTargetPackage?.clone();
    if (targetPackage) {
      targetPackage.performGitPull = checked ?? false;
      setActiveTargetPackage?.(targetPackage);
    }
  };

  const handleInstallChange = (mode?: PackageInstallModeValue): void => {
    const targetPackage = activeTargetPackage?.clone();
    if (targetPackage) {
      targetPackage.installMode = mode;
      setActiveTargetPackage?.(targetPackage);
    }
  };

  const handleDependenciesChange = (
    dependencies: DependencyPackage[]
  ): void => {
    setActiveDependencies?.(dependencies);
  };

  const excludedDirectories = [
    activeTargetPackage?.cwd ?? '',
    ...(activeDependencies?.map(d => d.cwd ?? '').filter(Boolean) ?? []),
  ];

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
      <PackageSelector
        targetPackage={activeTargetPackage}
        onPathChange={handlePathChange}
        onGitPullChange={handleGitPullChange}
        onInstallChange={handleInstallChange}
      />
      <Dependencies
        excludedDirectories={excludedDirectories}
        dependencies={activeDependencies}
        onDependenciesChange={handleDependenciesChange}
        activeTargetPackage={activeTargetPackage}
      />
    </>
  );
}

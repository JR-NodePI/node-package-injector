import DependencyPackage from '@renderer/models/DependencyPackage';
import { PackageScript } from '@renderer/models/PackageScriptsTypes';
import TargetPackage from '@renderer/models/TargetPackage';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import useGlobalData from '../GlobalDataProvider/useGlobalData';
import Dependencies from './Dependencies/Dependencies';
import PackageSelector from './PackageSelector/PackageSelector';

import styles from './PackageBunchPage.module.css';

export default function PackageBunchPage(): JSX.Element {
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
    const targetPackage = activeTargetPackage?.clone() ?? new TargetPackage();

    if (!isValidPackage) {
      targetPackage.performGitPull = false;
    }
    targetPackage.scripts = [];
    targetPackage.cwd = cwd;
    targetPackage.isValidPackage = isValidPackage;

    setActiveTargetPackage?.(targetPackage);
  };

  const handleGitPullChange = (checked?: boolean): void => {
    const targetPackage = activeTargetPackage?.clone();
    if (targetPackage) {
      targetPackage.performGitPull = checked ?? false;
      setActiveTargetPackage?.(targetPackage);
    }
  };

  const handleScriptsChange = (scripts: PackageScript[]): void => {
    const targetPackage = activeTargetPackage?.clone();
    if (targetPackage) {
      targetPackage.scripts = scripts;
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
        excludedDirectories={excludedDirectories}
        onGitPullChange={handleGitPullChange}
        onPathChange={handlePathChange}
        onScriptsChange={handleScriptsChange}
        targetPackage={activeTargetPackage}
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

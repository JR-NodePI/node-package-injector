import DependencyConfig from '@renderer/models/DependencyConfig';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import Dependencies from '../Dependencies/Dependencies';
import useGlobalData from '../GlobalDataProvider/hooks/useGlobalData';
import PackageSelector from '../PackageSelector/PackageSelector';

import styles from './PackagePage.module.css';

export default function PackagePage(): JSX.Element {
  const {
    packageConfigBunches,
    activePackageConfigBunch,
    setActivePackageConfig,
    setActiveDependencies,
  } = useGlobalData();
  const activeBunch = packageConfigBunches.find(bunch => bunch.active);
  const activePackageConfig = activeBunch?.packageConfig;
  const activeDependencies = activeBunch?.dependencies;

  const handlePathChange = (cwd: string, isValidPackage): void => {
    const packageConfig = activePackageConfig?.clone();
    if (packageConfig) {
      packageConfig.cwd = cwd;
      packageConfig.isValidPackage = isValidPackage;
      setActivePackageConfig?.(packageConfig);
    }
  };

  const handleGitPullChange = (checked?: boolean): void => {
    const packageConfig = activePackageConfig?.clone();
    if (packageConfig) {
      packageConfig.performGitPull = checked ?? false;
      setActivePackageConfig?.(packageConfig);
    }
  };

  const handleYarnInstallChange = (checked?: boolean): void => {
    const packageConfig = activePackageConfig?.clone();
    if (packageConfig) {
      packageConfig.performYarnInstall = checked ?? false;
      setActivePackageConfig?.(packageConfig);
    }
  };

  const handleDependenciesChange = (dependencies: DependencyConfig[]): void => {
    setActiveDependencies?.(dependencies);
  };

  const excludedDirectories = [
    activePackageConfig?.cwd ?? '',
    ...(activeDependencies?.map(d => d.cwd ?? '').filter(Boolean) ?? []),
  ];

  return (
    <>
      <h1 className={c(styles.title)}>
        Target
        <span className={c(styles.badge)}>
          <span
            className={c(styles.dot_color)}
            style={{ background: activePackageConfigBunch.color }}
          />
          {activePackageConfigBunch.name}
        </span>
      </h1>
      <PackageSelector
        packageConfig={activePackageConfig}
        onPathChange={handlePathChange}
        onGitPullChange={handleGitPullChange}
        onYarnInstallChange={handleYarnInstallChange}
      />
      <Dependencies
        excludedDirectories={excludedDirectories}
        dependencies={activeDependencies}
        onDependenciesChange={handleDependenciesChange}
        activePackageConfig={activePackageConfig}
      />
    </>
  );
}

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import type PackageConfigBunch from '@renderer/models/PackageConfigBunch';

import Dependencies from './Dependencies/Dependencies';
import PackageSelector from './PackageSelector/PackageSelector';

export default function PackagePage({
  id,
  packageConfig,
  dependencies,
  onPackageConfigChange,
  onDependenciesChange,
}: Omit<PackageConfigBunch, 'clone' | 'active'> & {
  onPackageConfigChange(bunchId: string, packageConfig: PackageConfig): void;
  onDependenciesChange(bunchId: string, dependencies: DependencyConfig[]): void;
}): JSX.Element {
  const handlePathChange = (cwd: string, isValidPackage): void => {
    const clone = packageConfig?.clone();
    if (clone) {
      clone.cwd = cwd;
      clone.isValidPackage = isValidPackage;
      onPackageConfigChange(id, clone);
    }
  };

  const handleGitPullChange = (checked?: boolean): void => {
    const clone = packageConfig.clone();
    if (clone) {
      clone.performGitPull = checked ?? false;
      onPackageConfigChange(id, clone);
    }
  };

  const handleYarnInstallChange = (checked?: boolean): void => {
    const clone = packageConfig.clone();
    if (clone) {
      clone.performYarnInstall = checked ?? false;
      onPackageConfigChange(id, clone);
    }
  };

  const handleDependenciesChange = (dependencies: DependencyConfig[]): void => {
    onDependenciesChange(id, dependencies);
  };

  const excludedDirectories = [
    packageConfig?.cwd ?? '',
    ...(dependencies?.map(d => d.cwd ?? '').filter(Boolean) ?? []),
  ];

  return (
    <>
      <h1>Target</h1>
      <PackageSelector
        packageConfig={packageConfig}
        onPathChange={handlePathChange}
        onGitPullChange={handleGitPullChange}
        onYarnInstallChange={handleYarnInstallChange}
      />
      <Dependencies
        excludedDirectories={excludedDirectories}
        dependencies={dependencies}
        onDependenciesChange={handleDependenciesChange}
        mainPackageConfig={packageConfig}
      />
    </>
  );
}

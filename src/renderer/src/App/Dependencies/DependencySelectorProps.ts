import type DependencyConfig from '@renderer/models/DependencyConfig';
import { type DependencyMode } from '@renderer/models/DependencyConfigConstants';
import { type PackageInstallModeValue } from '@renderer/models/PackageInstallMode';

export type DependencySelectorProps = {
  disabled?: boolean;
  dependencyConfig: DependencyConfig;
  excludedDirectories: string[];
  onClickRemove?: (dependencyConfig: DependencyConfig) => void;
  onGitPullChange: (
    dependencyConfig: DependencyConfig,
    checked?: boolean
  ) => void;
  onPathChange: (
    dependencyConfig: DependencyConfig,
    cwd: string,
    isValidPackage: boolean
  ) => void;
  onSyncModeChange: (
    dependencyConfig: DependencyConfig,
    mode: (typeof DependencyMode)[keyof typeof DependencyMode]
  ) => void;
  onPackageInstallChange: (
    dependencyConfig: DependencyConfig,
    mode?: PackageInstallModeValue
  ) => void;
};

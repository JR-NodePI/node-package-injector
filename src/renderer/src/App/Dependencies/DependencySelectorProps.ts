import { type DependencyMode } from '@renderer/models/DependencyConstants';
import type DependencyPackage from '@renderer/models/DependencyPackage';
import { type PackageInstallModeValue } from '@renderer/models/PackageInstallMode';

export type DependencySelectorProps = {
  disabled?: boolean;
  dependencyConfig: DependencyPackage;
  excludedDirectories: string[];
  onClickRemove?: (dependencyConfig: DependencyPackage) => void;
  onGitPullChange: (
    dependencyConfig: DependencyPackage,
    checked?: boolean
  ) => void;
  onPathChange: (
    dependencyConfig: DependencyPackage,
    cwd: string,
    isValidPackage: boolean
  ) => void;
  onModeChange: (
    dependencyConfig: DependencyPackage,
    mode: (typeof DependencyMode)[keyof typeof DependencyMode]
  ) => void;
  onInstallChange: (
    dependencyConfig: DependencyPackage,
    mode?: PackageInstallModeValue
  ) => void;
};

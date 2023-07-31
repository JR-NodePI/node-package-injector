import type DependencyConfig from '@renderer/models/DependencyConfig';
import { type DependencyMode } from '@renderer/models/DependencyConfigConstants';

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
  onYarnInstallChange: (
    dependencyConfig: DependencyConfig,
    checked?: boolean
  ) => void;
};

import { type DependencyMode } from '@renderer/models/DependencyConstants';
import type DependencyPackage from '@renderer/models/DependencyPackage';
import { type PackageInstallModeValue } from '@renderer/models/PackageInstallMode';

export type DependencySelectorProps = {
  disabled?: boolean;
  dependency: DependencyPackage;
  excludedDirectories: string[];
  onClickRemove?: (dependency: DependencyPackage) => void;
  onGitPullChange: (dependency: DependencyPackage, checked?: boolean) => void;
  onPathChange: (
    dependency: DependencyPackage,
    cwd: string,
    isValidPackage: boolean
  ) => void;
  onModeChange: (
    dependency: DependencyPackage,
    mode: (typeof DependencyMode)[keyof typeof DependencyMode]
  ) => void;
  onInstallChange: (
    dependency: DependencyPackage,
    mode?: PackageInstallModeValue
  ) => void;
  onScriptChange?: (dependency: DependencyPackage, script?: string) => void;
};

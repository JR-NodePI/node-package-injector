import { type PackageInstallModeValue } from '@renderer/models/PackageInstallMode';
import type TargetPackage from '@renderer/models/TargetPackage';

export type PackageSelectorProps = {
  disabled?: boolean;
  excludedDirectories?: string[];
  targetPackage?: TargetPackage;
  additionalComponent?: JSX.Element;
  onGitPullChange?: (checked?: boolean) => void;
  onPathChange?: (cwd: string, isValidPackage: boolean) => void;
  onInstallChange?: (mode?: PackageInstallModeValue) => void;
};

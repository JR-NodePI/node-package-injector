import { type PackageInstallModeValue } from '@renderer/models/PackageInstallMode';
import type TargetPackage from '@renderer/models/TargetPackage';

export type PackageSelectorProps = {
  additionalComponent?: JSX.Element;
  additionalOptionComponent?: JSX.Element;
  disabled?: boolean;
  excludedDirectories?: string[];
  onGitPullChange?: (checked?: boolean) => void;
  onInstallChange?: (mode?: PackageInstallModeValue) => void;
  onPathChange?: (cwd: string, isValidPackage: boolean) => void;
  targetPackage?: TargetPackage;
};

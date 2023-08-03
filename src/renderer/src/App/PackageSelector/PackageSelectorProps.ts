import { PackageScript } from '@renderer/models/PackageScriptsTypes';
import type TargetPackage from '@renderer/models/TargetPackage';

export type PackageSelectorProps = {
  additionalComponent?: JSX.Element;
  additionalOptionComponent?: JSX.Element;
  disabled?: boolean;
  excludedDirectories?: string[];
  onGitPullChange?: (checked?: boolean) => void;
  onPathChange?: (cwd: string, isValidPackage: boolean) => void;
  onScriptsChange?: (scripts: PackageScript[]) => void;
  targetPackage?: TargetPackage;
};

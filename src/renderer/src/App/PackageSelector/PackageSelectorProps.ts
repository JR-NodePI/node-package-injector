import type PackageConfig from '@renderer/models/PackageConfig';
import { type PackageInstallModeValue } from '@renderer/models/PackageInstallMode';

export type PackageSelectorProps = {
  disabled?: boolean;
  excludedDirectories?: string[];
  packageConfig?: PackageConfig;
  additionalComponent?: JSX.Element;
  onGitPullChange?: (checked?: boolean) => void;
  onPathChange?: (cwd: string, isValidPackage: boolean) => void;
  onPackageInstallChange?: (mode?: PackageInstallModeValue) => void;
};

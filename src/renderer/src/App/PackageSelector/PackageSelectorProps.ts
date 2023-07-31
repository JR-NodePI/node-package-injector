import PackageConfig from '@renderer/models/PackageConfig';

export type PackageSelectorProps = {
  disabled?: boolean;
  excludedDirectories?: string[];
  packageConfig?: PackageConfig;
  additionalComponent?: JSX.Element;
  onGitPullChange?: (checked?: boolean) => void;
  onPathChange?: (cwd: string, isValidPackage: boolean) => void;
  onYarnInstallChange?: (checked?: boolean) => void;
};

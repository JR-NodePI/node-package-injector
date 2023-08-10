import '../../../models/PackageScript';

import { Form } from 'fratch-ui';

import TargetPackage from '../../../models/TargetPackage';

export type DirectorySelectOption = Form.SelectProps.SelectOption<string>;

export type useDirectorySelectOptionsProps = {
  cwd: string;
  onDirectoriesLoad: () => void;
};

export type PackageSelectorProps = {
  additionalComponent?: JSX.Element;
  disabled?: boolean;
  onGitPullChange?: (checked?: boolean) => void;
  onPathChange?: (cwd: string, isValidPackage: boolean) => void;
  onScriptsChange?: (scripts: PackageScript[]) => void;
  targetPackage?: TargetPackage;
};

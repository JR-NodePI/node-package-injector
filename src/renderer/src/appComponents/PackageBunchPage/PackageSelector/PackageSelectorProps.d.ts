import '../../../models/PackageScript';

import { SelectProps } from 'fratch-ui/components';

import NodePackage from '../../../models/NodePackage';

export type DirectorySelectOption = SelectProps.SelectOption<string>;

export type useDirectorySelectOptionsProps = {
  cwd: string;
  onDirectoriesLoad: () => void;
};

export type PackageSelectorProps = {
  additionalComponent?: JSX.Element;
  disabled?: boolean;
  disableScripts?: boolean;
  onPathChange: (
    cwd: string,
    isValidPackage: boolean,
    packageName?: string
  ) => void;
  onScriptsChange: (scripts: PackageScript[]) => void;
  onAfterBuildScriptsChange?: (scripts: PackageScript[]) => void;
  nodePackage: NodePackage;
  findInstallScript?: boolean;
  findBuildScript?: boolean;
};

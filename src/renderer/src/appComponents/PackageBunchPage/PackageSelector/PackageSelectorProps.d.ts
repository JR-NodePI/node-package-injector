import '../../../models/PackageScript';

import { SelectProps } from 'fratch-ui/components';

import NodePackage from '../../../models/NodePackage';

export type DirectorySelectOption = SelectProps.SelectOption<string>;

export type useDirectorySelectOptionsProps = {
  cwd: string;
  onDirectoriesLoad?: (options: SelectProps.SelectOption<string>[]) => void;
  excludedDirectories?: string[];
};

export type PackageSelectorProps = {
  additionalActionComponents?: JSX.Element;
  scriptsLabel?: string;
  children?: JSX.Element;
  disabled?: boolean;
  enableScripts?: boolean;
  nodePackage: NodePackage;
  onPathChange: (
    cwd: string,
    isValidPackage: boolean,
    packageName?: string
  ) => void;
  onPostBuildScriptsChange?: (scripts: PackageScript[]) => void;
  onScriptsChange: (scripts: PackageScript[]) => void;
  scriptsLabelPostBuild?: string;
};

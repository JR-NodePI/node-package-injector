import '../../../models/PackageScript';

import { Form } from 'fratch-ui';

import NodePackage from '../../../models/NodePackage';

export type DirectorySelectOption = Form.SelectProps.SelectOption<string>;

export type useDirectorySelectOptionsProps = {
  cwd: string;
  onDirectoriesLoad: () => void;
};

export type PackageSelectorProps = {
  additionalComponent?: JSX.Element;
  disabled?: boolean;
  disableScripts?: boolean;
  onPathChange: (cwd: string, isValidPackage: boolean) => void;
  onScriptsChange: (scripts: PackageScript[]) => void;
  onAfterBuildScriptsChange?: (scripts: PackageScript[]) => void;
  nodePackage: NodePackage;
  findInstallScript?: boolean;
  findBuildScript?: boolean;
};

import '../../../models/PackageScript';

import React from 'react';

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
  children?: JSX.Element;
  disabled?: boolean;
  enablePackageScriptsSelectors?: boolean;
  nodePackage: NodePackage;
  onPathChange: (
    cwd: string,
    isValidPackage: boolean,
    packageName?: string
  ) => void;
  onPostBuildScriptsChange?: (scripts: PackageScript[]) => void;
  onPreInstallScriptsChange?: (scripts: PackageScript[]) => void;
  onScriptsChange: (scripts: PackageScript[]) => void;
  scriptsLabel?: React.ReactNode;
  scriptsLabelPostBuild?: React.ReactNode;
  scriptsLabelPreInstall?: React.ReactNode;
};

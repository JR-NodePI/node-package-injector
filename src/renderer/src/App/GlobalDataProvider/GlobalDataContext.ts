import React from 'react';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';

export type GlobalDataProps = {
  loading?: boolean;
  isValidTerminal?: boolean;
  dependencies?: DependencyConfig[];
  setDependencies?: React.Dispatch<React.SetStateAction<DependencyConfig[]>>;
  mainPackageConfig?: PackageConfig;
  setMainPackageConfig?: React.Dispatch<React.SetStateAction<PackageConfig>>;
  packageConfigBunches?: PackageConfigBunch[];
  setPackageConfigBunches?: React.Dispatch<
    React.SetStateAction<PackageConfigBunch[]>
  >;
};
const GlobalDataContext = React.createContext<GlobalDataProps>({});

export default GlobalDataContext;

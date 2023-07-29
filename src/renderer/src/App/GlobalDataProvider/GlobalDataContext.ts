import React from 'react';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';

export type GlobalDataProps = {
  loading?: boolean;
  isValidTerminal?: boolean;
  dependencies: DependencyConfig[];
  setDependencies?: (dependencies: DependencyConfig[]) => void;
  mainPackageConfig: PackageConfig;
  setMainPackageConfig?: (packageConfig: PackageConfig) => void;
  packageConfigBunches: PackageConfigBunch[];
  setPackageConfigBunches?: React.Dispatch<
    React.SetStateAction<PackageConfigBunch[]>
  >;
};
const GlobalDataContext = React.createContext<GlobalDataProps>({
  mainPackageConfig: new PackageConfig(),
  dependencies: [],
  packageConfigBunches: [],
});

export default GlobalDataContext;

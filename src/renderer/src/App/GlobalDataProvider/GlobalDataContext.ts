import React from 'react';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';

export type GlobalDataProps = {
  isWSLActive?: boolean;
  activeDependencies: DependencyConfig[];
  activePackageConfig: PackageConfig;
  defaultPackageConfig: PackageConfig;
  activePackageConfigBunch: PackageConfigBunch;
  isValidTerminal: boolean;
  loading?: boolean;
  packageConfigBunches: PackageConfigBunch[];
  setIsWSLActive?: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveDependencies?: (dependencies: DependencyConfig[]) => void;
  setActivePackageConfig?: (packageConfig: PackageConfig) => void;
  setPackageConfigBunches?: React.Dispatch<
    React.SetStateAction<PackageConfigBunch[]>
  >;
};
const GlobalDataContext = React.createContext<GlobalDataProps>({
  activeDependencies: [],
  activePackageConfig: new PackageConfig(),
  defaultPackageConfig: new PackageConfig(),
  activePackageConfigBunch: new PackageConfigBunch(),
  isValidTerminal: false,
  loading: true,
  packageConfigBunches: [],
});

export default GlobalDataContext;

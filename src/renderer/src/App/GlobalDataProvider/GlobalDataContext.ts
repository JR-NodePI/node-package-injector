import React from 'react';

import DependencyPackage from '@renderer/models/DependencyPackage';
import PackageBunch from '@renderer/models/PackageBunch';
import TargetPackage from '@renderer/models/TargetPackage';

export type GlobalDataProps = {
  isWSLActive?: boolean;
  activeDependencies: DependencyPackage[];
  activeTargetPackage: TargetPackage;
  activePackageBunch: PackageBunch;
  isValidTerminal: boolean;
  loading?: boolean;
  packageBunches: PackageBunch[];
  setIsWSLActive?: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveDependencies?: (dependencies: DependencyPackage[]) => void;
  setActiveTargetPackage?: (targetPackage: TargetPackage) => void;
  setPackageBunch?: React.Dispatch<React.SetStateAction<PackageBunch[]>>;
};
const GlobalDataContext = React.createContext<GlobalDataProps>({
  activeDependencies: [],
  activeTargetPackage: new TargetPackage(),
  activePackageBunch: new PackageBunch(),
  isValidTerminal: false,
  loading: true,
  packageBunches: [],
});

export default GlobalDataContext;

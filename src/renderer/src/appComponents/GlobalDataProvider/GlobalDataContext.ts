import React from 'react';

import DependencyPackage from '@renderer/models/DependencyPackage';
import PackageBunch from '@renderer/models/PackageBunch';
import TargetPackage from '@renderer/models/TargetPackage';

export type GlobalDataProps = {
  activeDependencies: DependencyPackage[];
  activePackageBunch: PackageBunch;
  activeTargetPackage: TargetPackage;
  isValidTerminal: boolean;
  isWSLActive?: boolean;
  loading?: boolean;
  nodeData: Record<string, string>;
  packageBunches: PackageBunch[];
  setActiveDependencies?: (dependencies: DependencyPackage[]) => Promise<void>;
  setActiveTargetPackage?: (targetPackage: TargetPackage) => Promise<void>;
  setIsGlobalLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsWSLActive?: (newData: boolean) => Promise<void>;
  setPackageBunch?: (newData: PackageBunch[]) => Promise<void>;
};
const GlobalDataContext = React.createContext<GlobalDataProps>({
  activeDependencies: [],
  activeTargetPackage: new TargetPackage(),
  activePackageBunch: new PackageBunch(),
  isValidTerminal: false,
  loading: true,
  packageBunches: [],
  nodeData: {},
});

export default GlobalDataContext;

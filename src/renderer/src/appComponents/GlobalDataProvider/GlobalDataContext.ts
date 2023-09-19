import React from 'react';

import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageBunch from '@renderer/models/PackageBunch';

export type GlobalDataProps = {
  activeDependencies: DependencyPackage[];
  activePackageBunch: PackageBunch;
  activeTargetPackage: NodePackage;
  isValidTerminal: boolean;
  isWSLActive?: boolean;
  loading?: boolean;
  nodeData: Record<string, string>;
  packageBunches: PackageBunch[];
  setActiveDependencies?: (dependencies: DependencyPackage[]) => Promise<void>;
  setActiveTargetPackage?: (targetPackage: NodePackage) => Promise<void>;
  setIsGlobalLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsWSLActive?: (newData: boolean) => Promise<void>;
  setPackageBunches?: (newData: PackageBunch[]) => Promise<void>;
};
const GlobalDataContext = React.createContext<GlobalDataProps>({
  activeDependencies: [],
  activeTargetPackage: new NodePackage(),
  activePackageBunch: new PackageBunch(),
  isValidTerminal: false,
  loading: true,
  packageBunches: [],
  nodeData: {},
});

export default GlobalDataContext;

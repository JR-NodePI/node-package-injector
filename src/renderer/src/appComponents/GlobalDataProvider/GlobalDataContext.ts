import React from 'react';

import DependencyPackage from '@renderer/models/DependencyPackage';
import LastSelectedScripts from '@renderer/models/LastSelectedScripts';
import NodePackage from '@renderer/models/NodePackage';
import PackageBunch from '@renderer/models/PackageBunch';
import PackageScript from '@renderer/models/PackageScript';

export type GlobalDataProps = {
  activeDependencies: DependencyPackage[];
  activePackageBunch: PackageBunch;
  activeTargetPackage: NodePackage;
  additionalPackageScripts: PackageScript[];
  getLastSelectedScripts?: (
    packageName: string
  ) => LastSelectedScripts | undefined;
  homePath: string;
  isValidTerminal: boolean;
  isWSLActive?: boolean;
  loading?: boolean;
  nodeData: Record<string, string>;
  packageBunches: PackageBunch[];
  setActiveDependencies?: (dependencies: DependencyPackage[]) => Promise<void>;
  setActiveTargetPackage?: (targetPackage: NodePackage) => Promise<void>;
  setAdditionalPackageScripts?: (
    additionalPackageScript: PackageScript[]
  ) => Promise<void>;
  setIsGlobalLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsWSLActive?: (newData: boolean) => Promise<void>;
  setLastSelectedScripts?: (lasSelectedScripts: LastSelectedScripts) => void;
  setPackageBunches?: (newData: PackageBunch[]) => Promise<void>;
};
const GlobalDataContext = React.createContext<GlobalDataProps>({
  activeDependencies: [],
  activePackageBunch: new PackageBunch(),
  activeTargetPackage: new NodePackage(),
  additionalPackageScripts: [],
  homePath: '',
  isValidTerminal: false,
  loading: true,
  nodeData: {},
  packageBunches: [],
});

export default GlobalDataContext;

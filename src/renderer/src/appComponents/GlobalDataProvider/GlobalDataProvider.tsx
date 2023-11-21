import { useCallback, useEffect, useMemo } from 'react';

import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageBunch from '@renderer/models/PackageBunch';
import PackageScript from '@renderer/models/PackageScript';
import { debounce } from 'lodash';

import {
  packageBunchesTemplate,
  packageScriptsTemplate,
} from '../../models/GlobalDataConstants';
import GlobalDataContext, { GlobalDataProps } from './GlobalDataContext';
import useLoadTerminal from './useCheckInitials';
import useLoadHomePath from './useLoadHomePath';
import usePersistedState from './usePersistedState';
import PathService from '@renderer/services/PathService';
import TerminalService from '@renderer/services/TerminalService';
import { NODE_PI_FILE_PREFIX } from '@renderer/constants';

export default function GlobalDataProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { isGlobalLoading, isValidTerminal, nodeData, setIsGlobalLoading } =
    useLoadTerminal();

  const [
    additionalPackageScripts,
    setAdditionalPackageScripts,
    isAdditionalPackageScriptsLoading,
  ] = usePersistedState<PackageScript[]>(
    'additionalPackageScripts',
    [],
    packageScriptsTemplate
  );

  const [isWSLActive, setIsWSLActive, isWSLActiveLoading] =
    usePersistedState<boolean>('isWSLActive', false);

  const { homePath, isHomePathLoading } = useLoadHomePath({ isWSLActive });

  const [packageBunches, setPackageBunches, packageBunchesLoading] =
    usePersistedState<PackageBunch[]>(
      'packageBunches',
      [],
      packageBunchesTemplate
    );

  const setPackageBunchActive = useCallback(
    (key: keyof PackageBunch, data: unknown): void => {
      const bunchIndex = packageBunches.findIndex(bunch => bunch.active);
      if (bunchIndex >= 0) {
        const newBunches = packageBunches.map((bunch, index) => {
          if (index === bunchIndex && key in bunch && key !== 'id') {
            (bunch[key] as unknown) = data;
          }
          return bunch;
        });
        setPackageBunches(newBunches);
      }
    },
    [packageBunches, setPackageBunches]
  );

  const _setActiveTargetPackage = useCallback(
    (targetPackage: NodePackage) => {
      setPackageBunchActive('targetPackage', targetPackage);
    },
    [setPackageBunchActive]
  );
  const setActiveTargetPackage = debounce(_setActiveTargetPackage, 10);

  const _setActiveDependencies = useCallback(
    (dependencies: DependencyPackage[]) => {
      setPackageBunchActive('dependencies', dependencies);
    },
    [setPackageBunchActive]
  );
  const setActiveDependencies = debounce(_setActiveDependencies, 10);

  const providerValue = useMemo<GlobalDataProps>((): GlobalDataProps => {
    const activePackageBunch =
      packageBunches?.find(bunch => bunch.active) ?? new PackageBunch();

    const activeDependencies = activePackageBunch?.dependencies ?? [];

    const activeTargetPackage =
      activePackageBunch?.targetPackage ?? new NodePackage();

    const loading =
      isAdditionalPackageScriptsLoading ||
      isGlobalLoading ||
      isWSLActiveLoading ||
      isHomePathLoading ||
      packageBunchesLoading;

    return {
      activeDependencies,
      activePackageBunch,
      activeTargetPackage,
      additionalPackageScripts,
      homePath,
      isValidTerminal,
      isWSLActive,
      loading,
      nodeData,
      packageBunches,
      setActiveDependencies,
      setActiveTargetPackage,
      setAdditionalPackageScripts,
      setIsGlobalLoading,
      setIsWSLActive,
      setPackageBunches,
    };
  }, [
    additionalPackageScripts,
    homePath,
    isAdditionalPackageScriptsLoading,
    isGlobalLoading,
    isHomePathLoading,
    isValidTerminal,
    isWSLActive,
    isWSLActiveLoading,
    nodeData,
    packageBunches,
    packageBunchesLoading,
    setActiveDependencies,
    setActiveTargetPackage,
    setAdditionalPackageScripts,
    setIsGlobalLoading,
    setIsWSLActive,
    setPackageBunches,
  ]);

  return (
    <GlobalDataContext.Provider value={providerValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

import { useMemo } from 'react';

import PackageScript from '@renderer/models/PackageScript';
import TerminalService from '@renderer/services/TerminalService';

import { packageScriptsTemplate } from '../../models/GlobalDataConstants';
import GlobalDataContext, { GlobalDataProps } from './GlobalDataContext';
import useLoadTerminal from './useCheckInitials';
import useLoadHomePath from './useLoadHomePath';
import usePersistedPackageBunches from './usePersistedPackageBunches';
import usePersistedState from './usePersistedState';

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
    usePersistedState<boolean>('isWSLActive', TerminalService.isWSLAvailable);

  const { homePath, isHomePathLoading } = useLoadHomePath({ isWSLActive });

  const {
    activeDependencies,
    activePackageBunch,
    activeTargetPackage,
    packageBunches,
    packageBunchesLoading,
    setActiveDependencies,
    setActiveTargetPackage,
    setLastSelectedScripts,
    setPackageBunches,
    getLastSelectedScripts,
  } = usePersistedPackageBunches();

  const providerValue = useMemo<GlobalDataProps>((): GlobalDataProps => {
    const loading =
      isAdditionalPackageScriptsLoading ||
      isGlobalLoading ||
      isHomePathLoading ||
      isWSLActiveLoading ||
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
      setLastSelectedScripts,
      getLastSelectedScripts,
    };
  }, [
    activeDependencies,
    activePackageBunch,
    activeTargetPackage,
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
    setLastSelectedScripts,
    getLastSelectedScripts,
  ]);

  return (
    <GlobalDataContext.Provider value={providerValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

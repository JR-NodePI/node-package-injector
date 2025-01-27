import { useMemo } from 'react';

import PackageScript from '@renderer/models/PackageScript';
import TerminalService from '@renderer/services/TerminalService';

import { packageScriptsTemplate } from '../../models/GlobalDataConstants';
import GlobalDataContext, { GlobalDataProps } from './GlobalDataContext';
import useLoadTerminal from './useCheckInitials';
import useLastSelectedScripts from './useLastSelectedScripts';
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
    setLastSelectedScripts,
    getLastSelectedScripts,
    lastSelectedPackagesScriptsLoading,
  } = useLastSelectedScripts();

  const {
    activeDependencies,
    activePackageBunch,
    activeTargetPackage,
    packageBunches,
    setActiveDependencies,
    setActiveTargetPackage,
    setPackageBunches,
    packageBunchesLoading,
  } = usePersistedPackageBunches();

  const providerValue = useMemo<GlobalDataProps>((): GlobalDataProps => {
    const loading =
      isAdditionalPackageScriptsLoading ||
      isGlobalLoading ||
      isHomePathLoading ||
      isWSLActiveLoading ||
      lastSelectedPackagesScriptsLoading ||
      packageBunchesLoading;

    return {
      activeDependencies,
      activePackageBunch,
      activeTargetPackage,
      additionalPackageScripts,
      getLastSelectedScripts,
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
    lastSelectedPackagesScriptsLoading,
    nodeData,
    packageBunches,
    packageBunchesLoading,
    setActiveDependencies,
    setActiveTargetPackage,
    setAdditionalPackageScripts,
    setIsGlobalLoading,
    setIsWSLActive,
    setPackageBunches,
    getLastSelectedScripts,
    setLastSelectedScripts,
  ]);

  return (
    <GlobalDataContext.Provider value={providerValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

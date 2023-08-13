import { useCallback, useMemo } from 'react';

import { debounce } from 'lodash';

import DependencyPackage from '@renderer/models/DependencyPackage';
import PackageBunch from '@renderer/models/PackageBunch';
import TargetPackage from '@renderer/models/TargetPackage';

import { packageBunchesTemplateValue } from './GlobalDataConstants';
import GlobalDataContext, { GlobalDataProps } from './GlobalDataContext';
import useLoadTerminal from './useCheckInitials';
import usePersistedState from './usePersistedState';

export default function GlobalDataProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { isGlobalLoading, isValidTerminal, nodeData, setIsGlobalLoading } =
    useLoadTerminal();

  const [isWSLActive, setIsWSLActive, isWSLActiveLoading] =
    usePersistedState<boolean>('isWSLActive', false);

  const [packageBunches, setPackageBunches, packageBunchesLoading] =
    usePersistedState<PackageBunch[]>(
      'packageBunches',
      [],
      packageBunchesTemplateValue
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
    (targetPackage: TargetPackage) => {
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
      activePackageBunch?.targetPackage ?? new TargetPackage();

    const loading =
      isGlobalLoading || packageBunchesLoading || isWSLActiveLoading;

    return {
      activeDependencies,
      activePackageBunch,
      activeTargetPackage,
      isValidTerminal,
      isWSLActive,
      loading,
      nodeData,
      packageBunches,
      setActiveDependencies,
      setActiveTargetPackage,
      setIsGlobalLoading,
      setIsWSLActive,
      setPackageBunches,
    };
  }, [
    isGlobalLoading,
    isValidTerminal,
    isWSLActive,
    isWSLActiveLoading,
    nodeData,
    packageBunches,
    packageBunchesLoading,
    setActiveDependencies,
    setActiveTargetPackage,
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

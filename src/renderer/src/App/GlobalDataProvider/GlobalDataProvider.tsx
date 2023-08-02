import { useCallback, useMemo } from 'react';

import DependencyPackage from '@renderer/models/DependencyPackage';
import PackageBunch from '@renderer/models/PackageBunch';
import TargetPackage from '@renderer/models/TargetPackage';
import { debounce } from 'lodash';

import GlobalDataContext, { GlobalDataProps } from './GlobalDataContext';
import useLoadTerminal from './useCheckInitials';
import usePersistedState from './usePersistedState';

const getPackageBunchTemplateValue = (): PackageBunch[] => {
  const template = new PackageBunch();
  template.targetPackage = new TargetPackage();
  template.dependencies = [new DependencyPackage()];
  return [template];
};

export default function GlobalDataProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { isValidTerminal, isValidTerminalLoading } = useLoadTerminal();

  const [isWSLActive, setIsWSLActive, isWSLActiveLoading] =
    usePersistedState<boolean>('isWSLActive', false);

  const [packageBunches, setPackageBunch, packageBunchesLoading] =
    usePersistedState<PackageBunch[]>(
      'packageBunches',
      [],
      getPackageBunchTemplateValue()
    );

  const setPackageBunchActive = (
    key: keyof PackageBunch,
    data: unknown
  ): void => {
    const bunchIndex = packageBunches.findIndex(bunch => bunch.active);
    if (bunchIndex >= 0) {
      setPackageBunch(
        packageBunches.map((bunch, index) => {
          if (index === bunchIndex) {
            bunch[key] = data;
          }
          return bunch;
        })
      );
    }
  };

  const setActiveTargetPackage = useCallback(
    debounce((targetPackage: TargetPackage) => {
      setPackageBunchActive('targetPackage', targetPackage);
    }, 10),
    [packageBunches]
  );

  const setActiveDependencies = useCallback(
    debounce((dependencies: DependencyPackage[]) => {
      setPackageBunchActive('dependencies', dependencies);
    }, 10),
    [packageBunches]
  );

  const providerValue = useMemo<GlobalDataProps>((): GlobalDataProps => {
    const activePackageBunch =
      packageBunches?.find(bunch => bunch.active) ?? new PackageBunch();

    const activeDependencies = activePackageBunch?.dependencies ?? [];

    const activeTargetPackage =
      activePackageBunch?.targetPackage ?? new TargetPackage();

    const loading =
      isValidTerminalLoading || packageBunchesLoading || isWSLActiveLoading;

    return {
      activeDependencies,
      activeTargetPackage,
      activePackageBunch,
      isValidTerminal,
      isWSLActive,
      loading,
      packageBunches,
      setActiveDependencies,
      setActiveTargetPackage,
      setIsWSLActive,
      setPackageBunch,
    };
  }, [
    isValidTerminal,
    isValidTerminalLoading,
    isWSLActive,
    isWSLActiveLoading,
    packageBunchesLoading,
    packageBunches,
    setActiveDependencies,
    setActiveTargetPackage,
    setIsWSLActive,
    setPackageBunch,
  ]);

  return (
    <GlobalDataContext.Provider value={providerValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

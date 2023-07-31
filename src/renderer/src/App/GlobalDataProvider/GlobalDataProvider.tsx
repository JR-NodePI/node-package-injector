import { useCallback, useMemo } from 'react';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
import { debounce } from 'lodash';

import GlobalDataContext, { GlobalDataProps } from './GlobalDataContext';
import useLoadTerminal from './hooks/useLoadTerminal';
import usePersistedState from './hooks/usePersistedState';

const getPackageConfigBunchesTemplateValue = (): PackageConfigBunch[] => {
  const template = new PackageConfigBunch();
  template.packageConfig = new PackageConfig();
  template.dependencies = [new DependencyConfig()];
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

  const [
    packageConfigBunches,
    setPackageConfigBunches,
    packageConfigBunchesLoading,
  ] = usePersistedState<PackageConfigBunch[]>(
    'packageConfigBunches',
    [],
    getPackageConfigBunchesTemplateValue()
  );

  const setPackageConfigBunchActive = (key: string, data: unknown): void => {
    const bunchIndex = packageConfigBunches.findIndex(bunch => bunch.active);
    if (bunchIndex >= 0) {
      setPackageConfigBunches(
        packageConfigBunches.map((bunch, index) => {
          if (index === bunchIndex) {
            bunch[key] = data;
          }
          return bunch;
        })
      );
    }
  };

  const setActivePackageConfig = useCallback(
    debounce((packageConfig: PackageConfig) => {
      setPackageConfigBunchActive('packageConfig', packageConfig);
    }, 10),
    [packageConfigBunches]
  );

  const setActiveDependencies = useCallback(
    debounce((dependencies: DependencyConfig[]) => {
      setPackageConfigBunchActive('dependencies', dependencies);
    }, 10),
    [packageConfigBunches]
  );

  const providerValue = useMemo<GlobalDataProps>((): GlobalDataProps => {
    const activePackageConfigBunch =
      packageConfigBunches?.find(bunch => bunch.active) ??
      new PackageConfigBunch();

    const activeDependencies = activePackageConfigBunch?.dependencies ?? [];

    const activePackageConfig =
      activePackageConfigBunch?.packageConfig ?? new PackageConfig();

    const loading =
      isValidTerminalLoading ||
      packageConfigBunchesLoading ||
      isWSLActiveLoading;

    return {
      activeDependencies,
      activePackageConfig,
      activePackageConfigBunch,
      isValidTerminal,
      isWSLActive,
      loading,
      packageConfigBunches,
      setActiveDependencies,
      setActivePackageConfig,
      setIsWSLActive,
      setPackageConfigBunches,
    };
  }, [
    isValidTerminal,
    isValidTerminalLoading,
    isWSLActive,
    isWSLActiveLoading,
    packageConfigBunchesLoading,
    packageConfigBunches,
    setActiveDependencies,
    setActivePackageConfig,
    setIsWSLActive,
    setPackageConfigBunches,
  ]);

  return (
    <GlobalDataContext.Provider value={providerValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

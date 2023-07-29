import { useCallback, useEffect, useMemo } from 'react';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
import { debounce } from 'lodash';

import GlobalDataContext, { GlobalDataProps } from './GlobalDataContext';
import useDefaultPackageConfig from './hooks/useDefaultPackageConfig';
import useLoadTerminal from './hooks/useLoadTerminal';
import usePersistedState from './hooks/usePersistedState';

export default function GlobalDataProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { loadingTerminal, isValidTerminal } = useLoadTerminal();

  const { defaultPackageConfig, loadingDefaultPackage } =
    useDefaultPackageConfig();

  const [packageConfigBunches, setPackageConfigBunches] = usePersistedState<
    PackageConfigBunch[]
  >('packageConfigBunches', [], PackageConfigBunch);

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

  useEffect(() => {
    if (
      !loadingDefaultPackage &&
      !packageConfigBunches?.length &&
      defaultPackageConfig?.cwd != null
    ) {
      const bunch = new PackageConfigBunch();
      bunch.packageConfig = defaultPackageConfig;
      bunch.dependencies = [];
      bunch.active = true;
      bunch.name = 'Package 1';
      setPackageConfigBunches([bunch]);
    }
  }, [loadingDefaultPackage, defaultPackageConfig, packageConfigBunches]);

  const setMainPackageConfig = useCallback(
    debounce((packageConfig: PackageConfig) => {
      setPackageConfigBunchActive('packageConfig', packageConfig);
    }, 10),
    [packageConfigBunches]
  );

  const setDependencies = useCallback(
    debounce((dependencies: DependencyConfig[]) => {
      setPackageConfigBunchActive('dependencies', dependencies);
    }, 10),
    [packageConfigBunches]
  );

  const providerValue = useMemo<GlobalDataProps>(() => {
    const loading = loadingTerminal || loadingDefaultPackage;
    const activeBunch =
      packageConfigBunches?.find(bunch => bunch.active) ??
      new PackageConfigBunch();
    const mainPackageConfig = activeBunch?.packageConfig ?? new PackageConfig();
    const dependencies = activeBunch?.dependencies ?? [];
    return {
      dependencies,
      isValidTerminal,
      loading,
      mainPackageConfig,
      packageConfigBunches,
      setDependencies,
      setMainPackageConfig,
      setPackageConfigBunches,
    };
  }, [
    isValidTerminal,
    loadingDefaultPackage,
    loadingTerminal,
    packageConfigBunches,
    setDependencies,
    setMainPackageConfig,
    setPackageConfigBunches,
  ]);

  return (
    <GlobalDataContext.Provider value={providerValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

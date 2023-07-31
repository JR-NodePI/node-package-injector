import { useCallback, useEffect, useMemo } from 'react';

import { getTabTitle } from '@renderer/helpers/utilsHelpers';
import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
import getRandomColor from 'fratch-ui/helpers/getRandomColor';
import { debounce } from 'lodash';

import GlobalDataContext, { GlobalDataProps } from './GlobalDataContext';
import useDefaultPackageConfig from './hooks/useDefaultPackageConfig';
import useLoadTerminal from './hooks/useLoadTerminal';
import usePersistedState from './hooks/usePersistedState';

const getTemplateValuePackageConfigBunches = (): PackageConfigBunch[] => {
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
  const { loadingTerminal, isValidTerminal } = useLoadTerminal();

  const [isWSLActive, setIsWSLActive, isWSLActiveLoading] =
    usePersistedState<boolean>('isWSLActive', false);

  const { defaultPackageConfig, loadingDefaultPackage } =
    useDefaultPackageConfig();

  const [
    packageConfigBunches,
    setPackageConfigBunches,
    loadingPersistedPackageConfigBunches,
  ] = usePersistedState<PackageConfigBunch[]>(
    'packageConfigBunches',
    [],
    getTemplateValuePackageConfigBunches()
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

  useEffect(() => {
    if (
      !loadingDefaultPackage &&
      !packageConfigBunches?.length &&
      defaultPackageConfig?.cwd != null
    ) {
      const bunch = new PackageConfigBunch();
      bunch.name = getTabTitle(1);
      bunch.color = getRandomColor();
      bunch.packageConfig = defaultPackageConfig;
      bunch.dependencies = [];
      bunch.active = true;
      setPackageConfigBunches([bunch]);
    }
  }, [loadingDefaultPackage, defaultPackageConfig, packageConfigBunches]);

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
      loadingTerminal ||
      loadingDefaultPackage ||
      loadingPersistedPackageConfigBunches ||
      isWSLActiveLoading;

    return {
      activeDependencies,
      activePackageConfig,
      activePackageConfigBunch,
      defaultPackageConfig,
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
    defaultPackageConfig,
    isValidTerminal,
    isWSLActive,
    isWSLActiveLoading,
    loadingDefaultPackage,
    loadingPersistedPackageConfigBunches,
    loadingTerminal,
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

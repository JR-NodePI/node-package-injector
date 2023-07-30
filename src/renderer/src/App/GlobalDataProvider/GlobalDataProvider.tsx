import { useCallback, useEffect, useMemo } from 'react';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
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

  const { defaultPackageConfig, loadingDefaultPackage } =
    useDefaultPackageConfig();

  const [packageConfigBunches, setPackageConfigBunches] = usePersistedState<
    PackageConfigBunch[]
  >('packageConfigBunches', [], getTemplateValuePackageConfigBunches());

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
      packageConfigBunches.find(bunch => bunch.active) ??
      new PackageConfigBunch();

    return {
      activeDependencies: activePackageConfigBunch?.dependencies ?? [],
      activePackageConfig:
        activePackageConfigBunch?.packageConfig ?? new PackageConfig(),
      activePackageConfigBunch,
      isValidTerminal,
      loading: loadingTerminal || loadingDefaultPackage,
      packageConfigBunches,
      setActiveDependencies,
      setActivePackageConfig,
      setPackageConfigBunches,
    };
  }, [
    isValidTerminal,
    loadingDefaultPackage,
    loadingTerminal,
    packageConfigBunches,
    setActiveDependencies,
    setActivePackageConfig,
    setPackageConfigBunches,
  ]);

  return (
    <GlobalDataContext.Provider value={providerValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

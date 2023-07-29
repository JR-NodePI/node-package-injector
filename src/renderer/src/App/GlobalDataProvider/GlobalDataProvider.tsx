import { useEffect, useMemo } from 'react';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';

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

  const [mainPackageConfig, setMainPackageConfig] =
    usePersistedState<PackageConfig>(
      'mainPackageConfig',
      new PackageConfig(),
      PackageConfig
    );

  const [dependencies, setDependencies] = usePersistedState<DependencyConfig[]>(
    'dependencies',
    [],
    DependencyConfig
  );

  useEffect(() => {
    if (
      !loadingDefaultPackage &&
      mainPackageConfig.cwd == null &&
      defaultPackageConfig.cwd != null
    ) {
      const clone = defaultPackageConfig.clone();
      setMainPackageConfig(clone);
    }
  }, [loadingDefaultPackage, defaultPackageConfig, mainPackageConfig]);

  useEffect(() => {
    if (mainPackageConfig.cwd != null) {
      const newBunch = new PackageConfigBunch();
      newBunch.packageConfig = mainPackageConfig;
      newBunch.active = true;
      newBunch.name = mainPackageConfig.id;
      setPackageConfigBunches([newBunch]);
    }
  }, [mainPackageConfig]);

  const providerValue = useMemo<GlobalDataProps>(
    () => ({
      loading: loadingTerminal || loadingDefaultPackage,
      isValidTerminal,
      dependencies,
      setDependencies,
      mainPackageConfig,
      setMainPackageConfig,
      packageConfigBunches,
      setPackageConfigBunches,
    }),
    [
      loadingDefaultPackage,
      loadingTerminal,
      isValidTerminal,
      dependencies,
      setDependencies,
      mainPackageConfig,
      setMainPackageConfig,
      packageConfigBunches,
      setPackageConfigBunches,
    ]
  );

  return (
    <GlobalDataContext.Provider value={providerValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

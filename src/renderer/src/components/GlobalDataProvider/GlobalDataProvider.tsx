import { useEffect, useMemo, useState } from 'react';

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

  const [mainPackageConfig, setMainPackageConfig] =
    usePersistedState<PackageConfig>(
      'mainPackageConfig',
      new PackageConfig(),
      PackageConfig
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

  const [dependencies, setDependencies] = usePersistedState<DependencyConfig[]>(
    'dependencies',
    [],
    DependencyConfig
  );

  const [packageConfigBunches, setPackageConfigBunches] = useState<
    PackageConfigBunch[]
  >([]);
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

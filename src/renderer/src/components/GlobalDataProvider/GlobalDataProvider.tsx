import { useEffect, useMemo } from 'react';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';

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

  const providerValue = useMemo<GlobalDataProps>(
    () => ({
      loading: loadingTerminal || loadingDefaultPackage,
      isValidTerminal,
      dependencies,
      setDependencies,
      mainPackageConfig,
      setMainPackageConfig,
    }),
    [
      loadingDefaultPackage,
      loadingTerminal,
      isValidTerminal,
      dependencies,
      setDependencies,
      mainPackageConfig,
      setMainPackageConfig,
    ]
  );
  return (
    <GlobalDataContext.Provider value={providerValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

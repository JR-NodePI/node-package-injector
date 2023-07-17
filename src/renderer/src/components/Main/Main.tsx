import { c } from 'fratch-ui/helpers/classNameHelpers';
import { Spinner } from 'fratch-ui';
import { useCallback, useEffect } from 'react';
import Dependencies from '../../components/Dependencies/Dependencies';
import DependencyConfig from '../../models/DependencyConfig';
import PackageConfig from '../../models/PackageConfig';
import PackageSelector from '../../components/PackageSelector/PackageSelector';
import PathService from '../../services/PathService';
import PersistService from '../../services/PersistService';
import useDefaultPackageConfig from './useDefaultPackageConfig';
import usePersistedState from '../../hooks/usePersistedState';
import WSLActivator from '../../components/WSLActivator/WSLActivator';

import styles from './Main.module.css';
import useCheckTerminal from '../CheckTerminalProvider/useCheckTerminal';
import GlobalError from '../GlobalError/GlobalError';

function Main(): JSX.Element {
  const { loadingTerminal, isValidTerminal } = useCheckTerminal();
  const { defaultPackageConfig, loadingDefaultPackage } =
    useDefaultPackageConfig();

  const [mainPackageConfig, setMainPackageConfig] =
    usePersistedState<PackageConfig>(
      'mainPackageConfig',
      new PackageConfig(),
      PackageConfig
    );

  const [dependencies, setDependencies] = usePersistedState<
    DependencyConfig[] | undefined
  >('dependencies', undefined, DependencyConfig);

  const excludedDirectories = [
    mainPackageConfig.cwd ?? '',
    ...(dependencies?.map(d => d.cwd ?? '').filter(Boolean) ?? []),
  ];

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

  const handlePathChange = (cwd: string, isValidPackage): void => {
    const clone = mainPackageConfig.clone();
    clone.cwd = cwd;
    clone.isValidPackage = isValidPackage;
    setMainPackageConfig(clone);
  };

  const handleGitPullChange = (checked?: boolean): void => {
    const clone = mainPackageConfig.clone();
    clone.performGitPull = checked ?? false;
    setMainPackageConfig(clone);
  };

  const handleYarnInstallChange = (checked?: boolean): void => {
    const clone = mainPackageConfig.clone();
    clone.performYarnInstall = checked ?? false;
    setMainPackageConfig(clone);
  };

  const handleWSLChange = useCallback((setWSL: boolean): void => {
    (async (): Promise<void> => {
      const newPackageConfig = mainPackageConfig.clone();
      newPackageConfig.cwd = await PathService.getHomePath(setWSL);

      await PersistService.clear();
      setDependencies(undefined);
      setMainPackageConfig(newPackageConfig);
    })();
  }, []);

  if (loadingDefaultPackage || loadingTerminal) {
    return <Spinner />;
  }

  if (!isValidTerminal) {
    return (
      <GlobalError>
        <h3>Terminal error</h3>
      </GlobalError>
    );
  }

  return (
    <>
      <WSLActivator cwd={mainPackageConfig.cwd} onChange={handleWSLChange} />
      <div className={c(styles.content)}>
        <h1>Target</h1>
        <PackageSelector
          key={mainPackageConfig.cwd}
          packageConfig={mainPackageConfig}
          onPathChange={handlePathChange}
          onGitPullChange={handleGitPullChange}
          onYarnInstallChange={handleYarnInstallChange}
        />
        <Dependencies
          excludedDirectories={excludedDirectories}
          dependencies={dependencies}
          setDependencies={setDependencies}
          mainPackageConfig={mainPackageConfig}
        />
      </div>
    </>
  );
}

export default Main;

import { useCallback } from 'react';
import { createPortal } from 'react-dom';

import { Spinner } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import Dependencies from '../../components/Dependencies/Dependencies';
import PackageSelector from '../../components/PackageSelector/PackageSelector';
import PathService from '../../services/PathService';
import PersistService from '../../services/PersistService';
import useGlobalData from '../GlobalDataProvider/useGlobalData';
import GlobalError from '../GlobalError/GlobalError';
import MainSettings from './MainSettings';

import styles from './Main.module.css';

function Main(): JSX.Element {
  const {
    loading,
    isValidTerminal,
    dependencies,
    setDependencies,
    mainPackageConfig,
    setMainPackageConfig,
  } = useGlobalData();

  const excludedDirectories = [
    mainPackageConfig?.cwd ?? '',
    ...(dependencies?.map(d => d.cwd ?? '').filter(Boolean) ?? []),
  ];

  const handlePathChange = (cwd: string, isValidPackage): void => {
    const clone = mainPackageConfig?.clone();
    if (clone) {
      clone.cwd = cwd;
      clone.isValidPackage = isValidPackage;
      setMainPackageConfig?.(clone);
    }
  };

  const handleGitPullChange = (checked?: boolean): void => {
    const clone = mainPackageConfig?.clone();
    if (clone) {
      clone.performGitPull = checked ?? false;
      setMainPackageConfig?.(clone);
    }
  };

  const handleYarnInstallChange = (checked?: boolean): void => {
    const clone = mainPackageConfig?.clone();
    if (clone) {
      clone.performYarnInstall = checked ?? false;
      setMainPackageConfig?.(clone);
    }
  };

  const handleWSLActiveChange = useCallback((setWSL: boolean): void => {
    (async (): Promise<void> => {
      const newPackageConfig = mainPackageConfig?.clone();
      if (newPackageConfig) {
        newPackageConfig.cwd = await PathService.getHomePath(setWSL);

        await PersistService.clear();
        setDependencies?.([]);
        setMainPackageConfig?.(newPackageConfig);
      }
    })();
  }, []);

  if (loading) {
    return createPortal(<Spinner cover />, document.body);
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
      <MainSettings
        cwd={mainPackageConfig?.cwd}
        onWSLActiveChange={handleWSLActiveChange}
      />
      <div className={c(styles.content)}>
        <h1>Target</h1>
        <PackageSelector
          key={mainPackageConfig?.cwd}
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

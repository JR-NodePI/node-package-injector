import { createPortal } from 'react-dom';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import { Spinner } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import GlobalError from '../components/GlobalError/GlobalError';
import PathService from '../services/PathService';
import PersistService from '../services/PersistService';
import useGlobalData from './GlobalDataProvider/useGlobalData';
import MainSettings from './MainSettings/MainSettings';
import PackagePage from './PackagePage/PackagePage';
import PackagesTabsMenu from './PackagesTabsMenu';

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

  const handleWSLActiveChange = (setWSL: boolean): void => {
    (async (): Promise<void> => {
      const newPackageConfig = mainPackageConfig?.clone();
      if (newPackageConfig) {
        newPackageConfig.cwd = await PathService.getHomePath(setWSL);

        await PersistService.clear();
        setDependencies?.([]);
        setMainPackageConfig?.(newPackageConfig);
      }
    })();
  };

  const handlePackageConfigChange = (
    _bunchId: string,
    packageConfig: PackageConfig
  ): void => {
    setMainPackageConfig?.(packageConfig);
  };

  const handleDependenciesChange = (
    _bunchId: string,
    dependencies: DependencyConfig[]
  ): void => {
    setDependencies?.(dependencies);
  };

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
        className={c(styles.main_settings)}
        cwd={mainPackageConfig?.cwd}
        onWSLActiveChange={handleWSLActiveChange}
      />
      <PackagesTabsMenu />
      <PackagePage
        id={mainPackageConfig.id}
        packageConfig={mainPackageConfig}
        dependencies={dependencies}
        onPackageConfigChange={handlePackageConfigChange}
        onDependenciesChange={handleDependenciesChange}
      />
    </>
  );
}

export default Main;

import { useCallback } from 'react';
import { createPortal } from 'react-dom';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import { Spinner } from 'fratch-ui';
import TabsMenu from 'fratch-ui/components/TabsMenu/TabsMenu';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import PathService from '../../services/PathService';
import PersistService from '../../services/PersistService';
import useGlobalData from '../GlobalDataProvider/useGlobalData';
import GlobalError from '../GlobalError/GlobalError';
import PackagePage from '../PackagePage/PackagePage';
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
      <TabsMenu className={c(styles.tabs_menu)} editable tabs={[]} />
      <PackagePage
        id={'xxxx'}
        packageConfig={mainPackageConfig ?? new PackageConfig()}
        dependencies={dependencies ?? []}
        onPackageConfigChange={(
          _bunchId: string,
          packageConfig: PackageConfig
        ): void => {
          setMainPackageConfig?.(packageConfig);
        }}
        onDependenciesChange={(
          _bunchId: string,
          dependencies: DependencyConfig[]
        ): void => {
          setDependencies?.(dependencies);
        }}
      />
    </>
  );
}

export default Main;

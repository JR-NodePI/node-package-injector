import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
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
    packageConfigBunches,
    setPackageConfigBunches,
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
        className={c(styles.main_settings)}
        cwd={mainPackageConfig?.cwd}
        onWSLActiveChange={handleWSLActiveChange}
      />
      <TabsMenu
        className={c(styles.tabs_menu)}
        editable
        tabs={(packageConfigBunches ?? []).map(bunch => {
          return { label: bunch.name, active: bunch.active };
        })}
        onTabRemove={({ index }): void => {
          setPackageConfigBunches?.(
            (packageConfigBunches ?? []).filter((_, i) => i !== index)
          );
        }}
        onTabClick={({ index }): void => {
          setPackageConfigBunches?.([
            ...(packageConfigBunches ?? []).map((bunch, i) => {
              const clone = bunch.clone();
              clone.active = i === index;
              return clone;
            }),
          ]);
        }}
        onTabEdit={({ label, index }): void => {
          setPackageConfigBunches?.([
            ...(packageConfigBunches ?? []).map((bunch, i) => {
              const clone = bunch.clone();
              if (i === index) {
                clone.name = label;
              }
              return clone;
            }),
          ]);
        }}
        onTabAdd={({ label }): void => {
          const newBunch = new PackageConfigBunch();
          newBunch.packageConfig = new PackageConfig();
          newBunch.name = label || newBunch.packageConfig.id;
          newBunch.active = true;
          setPackageConfigBunches?.([
            ...(packageConfigBunches ?? []).map(bunch => {
              const clone = bunch.clone();
              clone.active = false;
              return clone;
            }),
            newBunch,
          ]);
        }}
      />

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

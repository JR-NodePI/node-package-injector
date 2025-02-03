import { useEffect, useState } from 'react';

import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import { DependencyMode } from '@renderer/models/DependencyConstants';
import DependencyPackage from '@renderer/models/DependencyPackage';
import PackageScript from '@renderer/models/PackageScript';
import SyncDirectory from '@renderer/models/SyncDirectory';
import NodeService from '@renderer/services/NodeService/NodeService';
import PathService from '@renderer/services/PathService';
import { Button, IconPlus } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import DependencySelector from './DependencySelector';

import styles from './Dependencies.module.css';

const getUpdatedDependencyLits = (
  dependencies: DependencyPackage[] = [],
  dependencyToUpdate: DependencyPackage,
  updateCallback: () => DependencyPackage
): DependencyPackage[] =>
  dependencies.map((dependency: DependencyPackage) => {
    if (dependency.id === dependencyToUpdate.id) {
      return updateCallback();
    }
    return dependency;
  });

function Dependencies(): JSX.Element {
  const {
    activeDependencies,
    activeTargetPackage,
    getLastSelectedScripts,
    setActiveDependencies,
  } = useGlobalData();

  const [isTargetSynchronizable, setIsTargetSynchronizable] =
    useState<boolean>(false);

  useEffect(() => {
    (async (): Promise<void> => {
      if (activeTargetPackage.cwd != null) {
        setIsTargetSynchronizable(
          await NodeService.checkIsSynchronizable(activeTargetPackage.cwd)
        );
      }
    })();
  }, [activeTargetPackage.cwd]);

  const handleAddDependency = (): void => {
    if (
      activeTargetPackage?.cwd != null &&
      activeTargetPackage.isValidPackage
    ) {
      const dependency = new DependencyPackage();
      dependency.cwd = PathService.getPreviousPath(activeTargetPackage.cwd);
      setActiveDependencies?.([...(activeDependencies ?? []), dependency]);
    }
  };

  const handlePathChange = (
    dependency: DependencyPackage,
    cwd: string,
    isValidPackage: boolean,
    packageName?: string
  ): void => {
    if (!dependency || dependency.cwd === cwd) {
      return;
    }

    const newDependencies = getUpdatedDependencyLits(
      activeDependencies,
      dependency,
      () => {
        const clonedDependency = dependency.clone();
        if (!isValidPackage) {
          clonedDependency.mode = DependencyMode.BUILD;
        }
        clonedDependency.cwd = cwd;
        clonedDependency.syncDirectories = undefined;
        clonedDependency.preBuildScripts = undefined;
        clonedDependency.scripts = undefined;
        clonedDependency.postBuildScripts = undefined;
        clonedDependency.isValidPackage = isValidPackage;
        clonedDependency.packageName = packageName;

        const lastSelectedScripts = getLastSelectedScripts?.(packageName ?? '');
        if (lastSelectedScripts) {
          clonedDependency.scripts = lastSelectedScripts.dependencyScripts;
          clonedDependency.preBuildScripts =
            lastSelectedScripts.dependencyPreBuildScripts;
        }

        return clonedDependency;
      }
    );

    setActiveDependencies?.(newDependencies);
  };

  const handleRemoveDependency = (dependency: DependencyPackage): void => {
    setActiveDependencies?.(
      (activeDependencies ?? []).filter(({ id }) => id !== dependency.id)
    );
  };

  const changeDependencyProp = (
    dependency: DependencyPackage,
    key: keyof Omit<DependencyPackage, 'id' | 'version' | 'clone'>,
    value: DependencyPackage[typeof key]
  ): void => {
    const newDependencies = getUpdatedDependencyLits(
      activeDependencies,
      dependency,
      () => {
        dependency[key] = value as never;
        return dependency;
      }
    );
    setActiveDependencies?.(newDependencies);
  };

  const handleModeChange = (
    dependency: DependencyPackage,
    mode: typeof dependency.mode
  ): void => {
    changeDependencyProp(dependency, 'mode', mode);
    changeDependencyProp(dependency, 'syncDirectories', undefined);
  };

  const handlePreInstallScriptsChange = (
    dependency: DependencyPackage,
    scripts: PackageScript[]
  ): void => {
    changeDependencyProp(dependency, 'preBuildScripts', scripts);
  };

  const handleScriptsChange = (
    dependency: DependencyPackage,
    scripts: PackageScript[]
  ): void => {
    changeDependencyProp(dependency, 'scripts', scripts);
  };

  const handleSyncDirectoryChange = (
    dependency: DependencyPackage,
    srcSyncDirectories: SyncDirectory[]
  ): void => {
    changeDependencyProp(dependency, 'syncDirectories', srcSyncDirectories);
  };

  return (
    <div
      className={c(
        styles.dependencies,
        !activeTargetPackage?.isValidPackage ? styles.disabled : ''
      )}
    >
      <h2 className={c(styles.title)}>Dependencies</h2>
      {(activeDependencies ?? []).map(dependency => (
        <DependencySelector
          key={dependency.id}
          dependency={dependency}
          isTargetSynchronizable={isTargetSynchronizable}
          onClickRemove={handleRemoveDependency}
          onModeChange={handleModeChange}
          onPathChange={handlePathChange}
          onScriptsChange={handleScriptsChange}
          onPreInstallScriptsChange={handlePreInstallScriptsChange}
          onSyncDirectoryChange={handleSyncDirectoryChange}
        />
      ))}
      <div className={c(styles.buttons)}>
        <Button
          size="small"
          type="tertiary"
          label="Add new dependency"
          onClick={handleAddDependency}
          Icon={IconPlus}
          isRound
        />
      </div>
    </div>
  );
}

export default Dependencies;

import { useEffect, useState } from 'react';

import { Button, Icons } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import { DependencyMode } from '@renderer/models/DependencyConstants';
import DependencyPackage from '@renderer/models/DependencyPackage';
import PackageScript from '@renderer/models/PackageScript';
import NodeService from '@renderer/services/NodeService';
import PathService from '@renderer/services/PathService';

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
  const { activeTargetPackage, activeDependencies, setActiveDependencies } =
    useGlobalData();

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
    isValidPackage: boolean
  ): void => {
    const newDependencies = getUpdatedDependencyLits(
      activeDependencies,
      dependency,
      () => {
        const clonedDependency = dependency.clone();
        if (!isValidPackage) {
          clonedDependency.performGitPull = false;
          clonedDependency.mode = DependencyMode.BUILD;
        }
        clonedDependency.scripts = [];
        clonedDependency.cwd = cwd;
        clonedDependency.isValidPackage = isValidPackage;

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
    key: string,
    value: unknown
  ): void => {
    const newDependencies = getUpdatedDependencyLits(
      activeDependencies,
      dependency,
      () => {
        dependency[key] = value;
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
  };

  const handleGitPullChange = (
    dependency: DependencyPackage,
    checked?: boolean
  ): void => {
    changeDependencyProp(dependency, 'performGitPull', Boolean(checked));
  };

  const handleScriptsChange = (
    dependency: DependencyPackage,
    scripts: PackageScript[]
  ): void => {
    changeDependencyProp(
      dependency,
      'scripts',
      scripts.filter(({ scriptName }) => Boolean(scriptName.trim()))
    );
  };

  if (!activeTargetPackage?.isValidPackage) {
    return <></>;
  }

  return (
    <div className={c(styles.dependencies)}>
      <h2 className={c(styles.title)}>Dependencies</h2>
      {(activeDependencies ?? []).map(dependency => (
        <DependencySelector
          key={dependency.id}
          dependency={dependency}
          isTargetSynchronizable={isTargetSynchronizable}
          onClickRemove={handleRemoveDependency}
          onGitPullChange={handleGitPullChange}
          onModeChange={handleModeChange}
          onPathChange={handlePathChange}
          onScriptsChange={handleScriptsChange}
        />
      ))}
      <div className={c(styles.buttons)}>
        <Button
          size="small"
          type="tertiary"
          label="Add new dependency"
          onClick={handleAddDependency}
          Icon={Icons.IconPlus}
          isRound
        />
      </div>
    </div>
  );
}

export default Dependencies;

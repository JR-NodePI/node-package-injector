import { useState } from 'react';

import { DependencyMode } from '@renderer/models/DependencyConstants';
import DependencyPackage from '@renderer/models/DependencyPackage';
import { PackageScript } from '@renderer/models/PackageScriptsTypes';
import TargetPackage from '@renderer/models/TargetPackage';
import NPMService from '@renderer/services/NPMService';
import PathService from '@renderer/services/PathService';
import { Button, Icons } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

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

function Dependencies({
  excludedDirectories,
  dependencies,
  onDependenciesChange,
  activeTargetPackage,
}: {
  excludedDirectories: string[];
  dependencies?: DependencyPackage[];
  onDependenciesChange?: (dependencies: DependencyPackage[]) => void;
  activeTargetPackage?: TargetPackage;
}): JSX.Element {
  const [loading, setLoading] = useState(false);

  const setDependenciesWithNPM = async (
    newDependencies: DependencyPackage[]
  ): Promise<void> => {
    setLoading(true);
    onDependenciesChange?.(
      await NPMService.getDependenciesWithRelatedDependencyIds(newDependencies)
    );
    setLoading(false);
  };

  const handleAddDependency = (): void => {
    if (
      activeTargetPackage?.cwd != null &&
      activeTargetPackage.isValidPackage
    ) {
      const dependency = new DependencyPackage();
      dependency.cwd = PathService.getPreviousPath(activeTargetPackage.cwd);
      setDependenciesWithNPM([...(dependencies ?? []), dependency]);
    }
  };

  const handlePathChange = (
    dependency: DependencyPackage,
    cwd: string,
    isValidPackage: boolean
  ): void => {
    const newDependencies = getUpdatedDependencyLits(
      dependencies,
      dependency,
      () => {
        const newDependency = isValidPackage
          ? dependency.clone()
          : new DependencyPackage();

        if (!isValidPackage) {
          newDependency.performGitPull = false;
          newDependency.mode = DependencyMode.BUILD;
        }

        newDependency.scripts = [];
        newDependency.cwd = cwd;
        newDependency.isValidPackage = isValidPackage;
        newDependency.id = dependency.id;
        newDependency.relatedDependencyConfigIds = undefined;

        return newDependency;
      }
    );

    setDependenciesWithNPM(newDependencies);
  };

  const handleRemoveDependency = (dependency: DependencyPackage): void => {
    const newDependencies = (dependencies ?? []).filter(
      (d: DependencyPackage) => d !== dependency
    );

    setDependenciesWithNPM(newDependencies);
  };

  const changeDependencyProp = (
    dependency: DependencyPackage,
    key: string,
    value: unknown
  ): void => {
    const newDependencies = getUpdatedDependencyLits(
      dependencies,
      dependency,
      () => {
        const clone = dependency.clone();
        clone[key] = value;
        return clone;
      }
    );
    onDependenciesChange?.(newDependencies);
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
      {(dependencies ?? []).map(
        (dependency, index) =>
          (dependency.cwd ?? '').length > 2 && (
            <DependencySelector
              key={index}
              disabled={loading}
              dependency={dependency}
              excludedDirectories={excludedDirectories}
              onClickRemove={handleRemoveDependency}
              onGitPullChange={handleGitPullChange}
              onPathChange={handlePathChange}
              onModeChange={handleModeChange}
              onScriptsChange={handleScriptsChange}
            />
          )
      )}
      <div className={c(styles.buttons)}>
        <Button
          disabled={loading}
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

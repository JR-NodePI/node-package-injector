import { useState } from 'react';

import DependencyPackage from '@renderer/models/DependencyPackage';
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

  const handleScriptChange = (
    dependency: DependencyPackage,
    script?: string
  ): void => {
    changeDependencyProp(dependency, 'script', script);
  };

  if (!activeTargetPackage?.isValidPackage) {
    return <></>;
  }

  return (
    <div className={c(styles.dependencies)}>
      <h2>Dependencies</h2>
      {(dependencies ?? []).map(
        dependency =>
          (dependency.cwd ?? '').length > 2 && (
            <DependencySelector
              disabled={loading}
              dependency={dependency}
              excludedDirectories={excludedDirectories}
              key={dependency.id}
              onClickRemove={handleRemoveDependency}
              onGitPullChange={handleGitPullChange}
              onPathChange={handlePathChange}
              onModeChange={handleModeChange}
              onScriptChange={handleScriptChange}
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

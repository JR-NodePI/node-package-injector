import { useState } from 'react';

import DependencyPackage from '@renderer/models/DependencyPackage';
import { type PackageInstallModeValue } from '@renderer/models/PackageInstallMode';
import TargetPackage from '@renderer/models/TargetPackage';
import NPMService from '@renderer/services/NPMService';
import PathService from '@renderer/services/PathService';
import { Button, Icons } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import DependencySelector from './DependencySelector';

import styles from './Dependencies.module.css';

const getUpdatedDependencyLits = (
  dependencies: DependencyPackage[] = [],
  dependencyConfigToUpdate: DependencyPackage,
  updateCallback: () => DependencyPackage
): DependencyPackage[] =>
  dependencies.map((dependencyConfig: DependencyPackage) => {
    if (dependencyConfig.id === dependencyConfigToUpdate.id) {
      return updateCallback();
    }
    return dependencyConfig;
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
      await NPMService.getDependencyConfigsWithRelatedDependencyIds(
        newDependencies
      )
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
    dependencyConfig: DependencyPackage,
    cwd: string,
    isValidPackage: boolean
  ): void => {
    const newDependencies = getUpdatedDependencyLits(
      dependencies,
      dependencyConfig,
      () => {
        const newDependency = isValidPackage
          ? dependencyConfig.clone()
          : new DependencyPackage();

        newDependency.cwd = cwd;
        newDependency.isValidPackage = isValidPackage;
        newDependency.id = dependencyConfig.id;
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

  const handleModeChange = (
    dependencyConfig: DependencyPackage,
    mode: typeof dependencyConfig.mode
  ): void => {
    const newDependencies = getUpdatedDependencyLits(
      dependencies,
      dependencyConfig,
      () => {
        const clone = dependencyConfig.clone();
        clone.mode = mode;
        return clone;
      }
    );
    onDependenciesChange?.(newDependencies);
  };

  const handleGitPullChange = (
    dependencyConfig: DependencyPackage,
    checked?: boolean
  ): void => {
    const newDependencies = getUpdatedDependencyLits(
      dependencies,
      dependencyConfig,
      () => {
        const clone = dependencyConfig.clone();
        clone.performGitPull = Boolean(checked);
        return clone;
      }
    );
    onDependenciesChange?.(newDependencies);
  };

  const handleInstallChange = (
    dependencyConfig: DependencyPackage,
    mode?: PackageInstallModeValue
  ): void => {
    const newDependencies = getUpdatedDependencyLits(
      dependencies,
      dependencyConfig,
      () => {
        const clone = dependencyConfig.clone();
        clone.performInstallMode = mode;
        return clone;
      }
    );
    onDependenciesChange?.(newDependencies);
  };

  if (!activeTargetPackage?.isValidPackage) {
    return <></>;
  }

  return (
    <div className={c(styles.dependencies)}>
      <h2>Dependencies</h2>
      {(dependencies ?? []).map(
        dependencyConfig =>
          (dependencyConfig.cwd ?? '').length > 2 && (
            <DependencySelector
              disabled={loading}
              dependencyConfig={dependencyConfig}
              excludedDirectories={excludedDirectories}
              key={dependencyConfig.id}
              onClickRemove={handleRemoveDependency}
              onGitPullChange={handleGitPullChange}
              onPathChange={handlePathChange}
              onModeChange={handleModeChange}
              onInstallChange={handleInstallChange}
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

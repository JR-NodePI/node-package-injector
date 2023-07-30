import { useState } from 'react';

import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import NPMService from '@renderer/services/NPMService';
import PathService from '@renderer/services/PathService';
import { Button, Icons } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import DependencySelector from '../DependencySelector/DependencySelector';

import styles from './Dependencies.module.css';

const getUpdatedDependencyLits = (
  dependencies: DependencyConfig[] = [],
  dependencyConfigToUpdate: DependencyConfig,
  updateCallback: () => DependencyConfig
): DependencyConfig[] =>
  dependencies.map((dependencyConfig: DependencyConfig) => {
    if (dependencyConfig.id === dependencyConfigToUpdate.id) {
      return updateCallback();
    }
    return dependencyConfig;
  });

function Dependencies({
  excludedDirectories,
  dependencies,
  onDependenciesChange,
  activePackageConfig,
}: {
  excludedDirectories: string[];
  dependencies?: DependencyConfig[];
  onDependenciesChange?: (dependencies: DependencyConfig[]) => void;
  activePackageConfig?: PackageConfig;
}): JSX.Element {
  const [loading, setLoading] = useState(false);

  const setDependenciesWithNPM = async (
    newDependencies: DependencyConfig[]
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
      activePackageConfig?.cwd != null &&
      activePackageConfig.isValidPackage
    ) {
      const dependency = new DependencyConfig();
      dependency.cwd = PathService.getPreviousPath(activePackageConfig.cwd);
      setDependenciesWithNPM([...(dependencies ?? []), dependency]);
    }
  };

  const handlePathChange = (
    dependencyConfig: DependencyConfig,
    cwd: string,
    isValidPackage: boolean
  ): void => {
    const newDependencies = getUpdatedDependencyLits(
      dependencies,
      dependencyConfig,
      () => {
        const newDependency = isValidPackage
          ? dependencyConfig.clone()
          : new DependencyConfig();

        newDependency.cwd = cwd;
        newDependency.isValidPackage = isValidPackage;
        newDependency.id = dependencyConfig.id;
        newDependency.relatedDependencyConfigIds = undefined;

        return newDependency;
      }
    );

    setDependenciesWithNPM(newDependencies);
  };

  const handleRemoveDependency = (dependency: DependencyConfig): void => {
    const newDependencies = (dependencies ?? []).filter(
      (d: DependencyConfig) => d !== dependency
    );

    setDependenciesWithNPM(newDependencies);
  };

  const handleSyncModeChange = (
    dependencyConfig: DependencyConfig,
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
    dependencyConfig: DependencyConfig,
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

  const handleYarnInstallChange = (
    dependencyConfig: DependencyConfig,
    checked?: boolean
  ): void => {
    const newDependencies = getUpdatedDependencyLits(
      dependencies,
      dependencyConfig,
      () => {
        const clone = dependencyConfig.clone();
        clone.performYarnInstall = Boolean(checked);
        return clone;
      }
    );
    onDependenciesChange?.(newDependencies);
  };

  if (!activePackageConfig?.isValidPackage) {
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
              onSyncModeChange={handleSyncModeChange}
              onYarnInstallChange={handleYarnInstallChange}
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

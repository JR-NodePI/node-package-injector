import { Button } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';
import { IconPlus } from 'fratch-ui/components/Icon/Icons';
import { useEffect } from 'react';
import DependencyConfig from '@renderer/models/DependencyConfig';
import DependencySelector from '../DependencySelector/DependencySelector';
import usePersistedState from '@renderer/hooks/usePersistedState';

import styles from './Dependencies.module.css';
import PackageConfig from '@renderer/models/PackageConfig';

const getUpdatedDependencyLits = (
  dependencies: DependencyConfig[],
  dependencyConfigToUpdate: DependencyConfig,
  updateCallback: () => DependencyConfig
): DependencyConfig[] =>
  dependencies.map((dependencyConfig: DependencyConfig) => {
    if (dependencyConfig.uuid === dependencyConfigToUpdate.uuid) {
      return updateCallback();
    }
    return dependencyConfig;
  });

function Dependencies({ mainPackageConfig }: { mainPackageConfig: PackageConfig }): JSX.Element {
  const [stateDependencies, setDependencies] = usePersistedState<DependencyConfig[] | undefined>(
    'dependencies',
    undefined,
    DependencyConfig
  );
  const dependencies = stateDependencies ?? [];

  const handleRemoveDependency = (dependency: DependencyConfig): void => {
    const newDependencies = dependencies.filter((d: DependencyConfig) => d !== dependency);
    setDependencies(newDependencies);
  };

  const handlePathChange = (
    dependencyConfig: DependencyConfig,
    cwd: string,
    isValidPackage: boolean
  ): void => {
    const newDependencies = getUpdatedDependencyLits(dependencies, dependencyConfig, () => {
      const clone = dependencyConfig.clone();
      clone.cwd = cwd;
      clone.isValidPackage = isValidPackage;
      return clone;
    });

    setDependencies(newDependencies);
  };

  const handleBranchChange = (dependencyConfig: DependencyConfig, branch?: string): void => {
    const newDependencies = getUpdatedDependencyLits(dependencies, dependencyConfig, () => {
      const clone = dependencyConfig.clone();
      clone.branch = branch;
      return clone;
    });
    setDependencies(newDependencies);
  };

  const handleSyncModeChange = (
    dependencyConfig: DependencyConfig,
    mode: typeof dependencyConfig.mode
  ): void => {
    const newDependencies = getUpdatedDependencyLits(dependencies, dependencyConfig, () => {
      const clone = dependencyConfig.clone();
      clone.mode = mode;
      return clone;
    });
    setDependencies(newDependencies);
  };

  const handleGitPullChange = (dependencyConfig: DependencyConfig, checked: boolean): void => {
    const newDependencies = getUpdatedDependencyLits(dependencies, dependencyConfig, () => {
      const clone = dependencyConfig.clone();
      clone.performGitPull = checked;
      return clone;
    });
    setDependencies(newDependencies);
  };

  const handleYarnInstallChange = (dependencyConfig: DependencyConfig, checked: boolean): void => {
    const newDependencies = getUpdatedDependencyLits(dependencies, dependencyConfig, () => {
      const clone = dependencyConfig.clone();
      clone.performYarnInstall = checked;
      return clone;
    });
    setDependencies(newDependencies);
  };

  const handleAddDependency = (): void => {
    if (mainPackageConfig.cwd != null && mainPackageConfig.isValidPackage) {
      const dependency = new DependencyConfig();
      dependency.cwd = (mainPackageConfig.cwd || window.api.os.homedir())
        .split(/\/|\\/)
        .filter(Boolean)
        .slice(0, -1)
        .join('/');
      setDependencies([...dependencies, dependency]);
    }
  };

  // Add a dependency if there are no dependencies and there is a main path
  useEffect(() => {
    if (
      mainPackageConfig.cwd != null &&
      mainPackageConfig.isValidPackage &&
      stateDependencies == null
    ) {
      handleAddDependency();
    }
  }, [dependencies, mainPackageConfig.cwd, mainPackageConfig.isValidPackage]);

  return (
    <div className={c(styles.dependencies)}>
      <h2>Dependencies</h2>

      {dependencies.map(dependencyConfig => (
        <DependencySelector
          key={dependencyConfig.uuid}
          dependencyConfig={dependencyConfig}
          onClickRemove={handleRemoveDependency}
          onPathChange={handlePathChange}
          onBranchChange={handleBranchChange}
          onGitPullChange={handleGitPullChange}
          onSyncModeChange={handleSyncModeChange}
          onYarnInstallChange={handleYarnInstallChange}
        />
      ))}
      {mainPackageConfig.isValidPackage && (
        <div className={c(styles.buttons)}>
          <Button
            size="small"
            type="tertiary"
            label="Add"
            onClick={handleAddDependency}
            Icon={IconPlus}
            isRound
          />
        </div>
      )}
    </div>
  );
}

export default Dependencies;

import PackageSelector from '../PackageSelector/PackageSelector';
import { c } from 'fratch-ui/helpers/classNameHelpers';
import { Button, InputCheck } from 'fratch-ui';
import DependencyConfig, { DependencyMode } from '@renderer/models/DependencyConfig';
import IconClose from 'fratch-ui/components/Icon/IconClose';

import styles from './DependencySelector.module.css';

function DependencySelector({
  dependencyConfig,
  onBranchChange,
  onClickRemove,
  onGitPullChange,
  onPathChange,
  onSyncModeChange,
  onYarnInstallChange,
}: {
  dependencyConfig: DependencyConfig;
  onBranchChange: (dependencyConfig: DependencyConfig, branch?: string) => void;
  onClickRemove?: (dependencyConfig: DependencyConfig) => void;
  onGitPullChange: (dependencyConfig: DependencyConfig, checked: boolean) => void;
  onPathChange: (dependencyConfig: DependencyConfig, cwd: string, isValidPackage: boolean) => void;
  onSyncModeChange: (
    dependencyConfig: DependencyConfig,
    mode: typeof dependencyConfig.mode
  ) => void;
  onYarnInstallChange: (dependencyConfig: DependencyConfig, checked: boolean) => void;
}): JSX.Element {
  const handlePathChange = (cwd: string, isValidPackage): void => {
    onPathChange(dependencyConfig, cwd, isValidPackage);
  };

  const handleBranchChange = (branch?: string): void => {
    onBranchChange(dependencyConfig, branch);
  };

  return (
    <div className={c(styles.dependency)}>
      <PackageSelector
        additionalComponent={
          <InputCheck
            checked={dependencyConfig.mode === DependencyMode.SYNC}
            label="sync mode"
            onChange={(event): void => {
              onSyncModeChange(
                dependencyConfig,
                event.target.checked ? DependencyMode.SYNC : DependencyMode.BUILD
              );
            }}
          />
        }
        packageConfig={dependencyConfig}
        onPathChange={handlePathChange}
        onBranchChange={handleBranchChange}
        onGitPullChange={(checked): void => {
          onGitPullChange(dependencyConfig, checked);
        }}
        onYarnInstallChange={(checked): void => {
          onYarnInstallChange(dependencyConfig, checked);
        }}
      />
      {onClickRemove && (
        <div className={c(styles.buttons)}>
          <Button
            size="small"
            label="Remove dependencyConfig"
            onClick={(): void => onClickRemove(dependencyConfig)}
            Icon={IconClose}
            isRound
          />
        </div>
      )}
    </div>
  );
}

export default DependencySelector;

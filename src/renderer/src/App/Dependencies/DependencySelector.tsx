import { DependencyMode } from '@renderer/models/DependencyConfigConstants';
import { Button, Form } from 'fratch-ui';
import { Icons } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import PackageSelector from '../PackageSelector/PackageSelector';
import { type DependencySelectorProps } from './DependencySelectorProps';

import styles from './DependencySelector.module.css';

function DependencySelector({
  disabled,
  dependencyConfig,
  excludedDirectories,
  onClickRemove,
  onGitPullChange,
  onPathChange,
  onSyncModeChange,
  onYarnInstallChange,
}: DependencySelectorProps): JSX.Element {
  const handlePathChange = (cwd: string, isValidPackage): void => {
    onPathChange(dependencyConfig, cwd, isValidPackage);
  };

  return (
    <div className={c(styles.dependency)}>
      <PackageSelector
        disabled={disabled}
        excludedDirectories={excludedDirectories}
        additionalComponent={
          <Form.InputCheck
            disabled={disabled}
            checked={dependencyConfig.mode === DependencyMode.SYNC}
            label="sync mode"
            onChange={(event): void => {
              onSyncModeChange(
                dependencyConfig,
                event.target.checked
                  ? DependencyMode.SYNC
                  : DependencyMode.BUILD
              );
            }}
          />
        }
        packageConfig={dependencyConfig}
        onPathChange={handlePathChange}
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
            disabled={disabled}
            size="small"
            label="Remove dependency"
            onClick={(): void => onClickRemove(dependencyConfig)}
            Icon={Icons.IconClose}
            isRound
          />
        </div>
      )}
    </div>
  );
}

export default DependencySelector;

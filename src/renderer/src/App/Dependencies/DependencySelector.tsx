import { Button } from 'fratch-ui';
import { Icons } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import PackageSelector from '../PackageSelector/PackageSelector';
import DependencyModeSelector from './DependencyModeSelector';
import { type DependencySelectorProps } from './DependencySelectorProps';

import styles from './DependencySelector.module.css';

export default function DependencySelector({
  disabled,
  dependencyConfig,
  excludedDirectories,
  onClickRemove,
  onGitPullChange,
  onPathChange,
  onModeChange,
  onInstallChange,
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
          <DependencyModeSelector
            disabled={disabled}
            dependencyConfig={dependencyConfig}
            onModeChange={onModeChange}
          />
        }
        targetPackage={dependencyConfig}
        onPathChange={handlePathChange}
        onGitPullChange={(checked): void => {
          onGitPullChange(dependencyConfig, checked);
        }}
        onInstallChange={(checked): void => {
          onInstallChange(dependencyConfig, checked);
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

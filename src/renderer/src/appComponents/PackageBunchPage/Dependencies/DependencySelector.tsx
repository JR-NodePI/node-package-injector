import { DependencyMode } from '@renderer/models/DependencyConstants';
import { Button } from 'fratch-ui';
import { Icons } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import PackageSelector from '../PackageSelector/PackageSelector';
import DependencyModeCheck from './DependencyModeCheck';
import type { DependencySelectorProps } from './DependencySelectorProps';

import styles from './DependencySelector.module.css';

export default function DependencySelector({
  disabled,
  dependency,
  isTargetSynchronizable,
  onClickRemove,
  onGitPullChange,
  onPathChange,
  onModeChange,
  onScriptsChange,
}: DependencySelectorProps): JSX.Element {
  const handlePathChange = (cwd: string, isValidPackage): void => {
    onPathChange(dependency, cwd, isValidPackage);
  };

  const handleGitPullChange = (checked): void => {
    onGitPullChange(dependency, checked);
  };

  const handleScriptsChange = (scripts): void => {
    onScriptsChange(dependency, scripts);
  };

  return (
    <div className={c(styles.dependency)}>
      <PackageSelector
        additionalComponent={
          <>
            {isTargetSynchronizable && (
              <span title="Sync mode will be available very soon, stay tuned!">
                <DependencyModeCheck
                  disabled
                  dependency={dependency}
                  onModeChange={onModeChange}
                />
              </span>
            )}
          </>
        }
        disabled={disabled}
        disableScripts={dependency.mode !== DependencyMode.BUILD}
        nodePackage={dependency}
        onPathChange={handlePathChange}
        onGitPullChange={handleGitPullChange}
        onScriptsChange={handleScriptsChange}
      />
      {onClickRemove && (
        <div className={c(styles.buttons)}>
          <Button
            disabled={disabled}
            size="small"
            label="Remove dependency"
            onClick={(): void => onClickRemove(dependency)}
            Icon={Icons.IconClose}
            isRound
          />
        </div>
      )}
    </div>
  );
}

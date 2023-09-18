import { Button } from 'fratch-ui';
import { Icons } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import PackageSelector from '../PackageSelector/PackageSelector';
import DependencyModeCheck from './DependencyModeCheck';
import type { DependencySelectorProps } from './DependencySelectorProps';

import styles from './DependencySelector.module.css';
import { DependencyMode } from '@renderer/models/DependencyConstants';

export default function DependencySelector({
  disabled,
  dependency,
  isTargetSynchronizable: isTargetSinchronizable,
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
            {isTargetSinchronizable && (
              <DependencyModeCheck
                dependency={dependency}
                onModeChange={onModeChange}
              />
            )}
          </>
        }
        disabled={disabled}
        disableScripts={dependency.mode !== DependencyMode.BUILD}
        targetPackage={dependency}
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

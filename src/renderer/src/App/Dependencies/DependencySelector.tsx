import { DependencyMode } from '@renderer/models/DependencyConstants';
import { Button } from 'fratch-ui';
import { Icons } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import PackageSelector from '../PackageSelector/PackageSelector';
import DependencyModeCheck from './DependencyModeCheck';
import DependencyScriptSelector from './DependencyScriptSelector';
import { type DependencySelectorProps } from './DependencySelectorProps';

import styles from './DependencySelector.module.css';

export default function DependencySelector({
  disabled,
  dependency,
  excludedDirectories,
  onClickRemove,
  onGitPullChange,
  onPathChange,
  onModeChange,
  onScriptChange,
}: DependencySelectorProps): JSX.Element {
  const handlePathChange = (cwd: string, isValidPackage): void => {
    onPathChange(dependency, cwd, isValidPackage);
  };

  return (
    <div className={c(styles.dependency)}>
      <PackageSelector
        additionalOptionComponent={
          <DependencyModeCheck
            disabled //TODO: ={disabled}, enable when sync mode will be implemented
            dependency={dependency}
            onModeChange={onModeChange}
          />
        }
        additionalComponent={
          dependency.isValidPackage &&
          dependency.mode === DependencyMode.BUILD ? (
            <DependencyScriptSelector
              dependency={dependency}
              onScriptChange={onScriptChange}
            />
          ) : (
            <></>
          )
        }
        disabled={disabled}
        excludedDirectories={excludedDirectories}
        targetPackage={dependency}
        onPathChange={handlePathChange}
        onGitPullChange={(checked): void => {
          onGitPullChange(dependency, checked);
        }}
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

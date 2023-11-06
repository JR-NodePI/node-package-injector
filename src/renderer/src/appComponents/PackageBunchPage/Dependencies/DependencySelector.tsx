import { DependencyMode } from '@renderer/models/DependencyConstants';
import { Button } from 'fratch-ui/components';
import { IconClose } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import PackageSelector from '../PackageSelector/PackageSelector';
import DependencyModeCheck from './DependencyModeCheck';
import type { DependencySelectorProps } from './DependencySelectorProps';

import styles from './DependencySelector.module.css';

export default function DependencySelector({
  disabled,
  dependency,
  isTargetSynchronizable,
  onClickRemove,
  onPathChange,
  onModeChange,
  onScriptsChange,
}: DependencySelectorProps): JSX.Element {
  const handlePathChange = (
    cwd: string,
    isValidPackage: boolean,
    packageName?: string
  ): void => {
    onPathChange(dependency, cwd, isValidPackage, packageName);
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
              <span title="Inject this dependency in sync mode">
                <DependencyModeCheck
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
        onScriptsChange={handleScriptsChange}
        findInstallScript
        findBuildScript
      />
      <div className={c(styles.buttons)}>
        <Button
          disabled={disabled}
          size="small"
          label="Remove dependency"
          onClick={(): void => onClickRemove(dependency)}
          Icon={IconClose}
          isRound
        />
      </div>
    </div>
  );
}

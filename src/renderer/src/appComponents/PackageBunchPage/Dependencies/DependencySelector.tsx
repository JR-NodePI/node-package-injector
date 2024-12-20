import { DependencyMode } from '@renderer/models/DependencyConstants';
import { Button } from 'fratch-ui/components';
import { IconClose } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import PackageSelector from '../PackageSelector/PackageSelector';
import DependencyModeCheck from './DependencyModeCheck';
import type { DependencySelectorProps } from './DependencySelectorProps';
import SyncDirectories from './SrcSyncDirectories/SyncDirectories';

import styles from './DependencySelector.module.css';

export default function DependencySelector({
  disabled,
  dependency,
  isTargetSynchronizable,
  onClickRemove,
  onPathChange,
  onModeChange,
  onPreInstallScriptsChange,
  onScriptsChange,
  onSyncDirectoryChange: onSrcSyncChange,
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

  const handlePreInstallScriptsChange = (scripts): void => {
    onPreInstallScriptsChange(dependency, scripts);
  };

  return (
    <div className={c(styles.dependency)}>
      <PackageSelector
        additionalActionComponents={
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
        enablePackageScriptsSelectors={dependency.mode === DependencyMode.BUILD}
        nodePackage={dependency}
        onPathChange={handlePathChange}
        onPreInstallScriptsChange={handlePreInstallScriptsChange}
        onScriptsChange={handleScriptsChange}
        scriptsLabelPreInstall={
          <>
            Scripts <small>({dependency.packageName} - installation)</small>
          </>
        }
        scriptsLabel={
          <>
            Scripts <small>({dependency.packageName} - building)</small>
          </>
        }
      >
        <>
          {dependency.mode === DependencyMode.SYNC && (
            <SyncDirectories
              dependency={dependency}
              onSyncDirectoryChange={onSrcSyncChange}
            />
          )}
        </>
      </PackageSelector>
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

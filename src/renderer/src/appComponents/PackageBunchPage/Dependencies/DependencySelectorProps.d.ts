import { type DependencyMode } from '@renderer/models/DependencyConstants';
import type DependencyPackage from '@renderer/models/DependencyPackage';
import PackageScript from '@renderer/models/PackageScript';
import SyncDirectory from '@renderer/models/SyncDirectory';

export type DependencySelectorProps = {
  disabled?: boolean;
  dependency: DependencyPackage;
  isTargetSynchronizable: boolean;
  onClickRemove: (dependency: DependencyPackage) => void;
  onPathChange: (
    dependency: DependencyPackage,
    cwd: string,
    isValidPackage: boolean,
    packageName?: string
  ) => void;
  onModeChange: (
    dependency: DependencyPackage,
    mode: (typeof DependencyMode)[keyof typeof DependencyMode]
  ) => void;
  onScriptsChange: (
    dependency: DependencyPackage,
    scripts: PackageScript[]
  ) => void;
  onSyncDirectoryChange: (
    dependency: DependencyPackage,
    srcSyncDirectories: SyncDirectory[]
  ) => void;
};

import type { CSSProperties } from 'react';

import { DependencyMode } from '@renderer/models/DependencyConstants';

import NodePackage from './NodePackage';
import type SyncDirectory from './SyncDirectory';

export default class DependencyPackage extends NodePackage {
  public mode: (typeof DependencyMode)[keyof typeof DependencyMode] =
    DependencyMode.BUILD;

  public syncDirectories?: SyncDirectory[];
  public disabled = false;
  public color: CSSProperties['color'] = '#ccc';

  public clone(): DependencyPackage {
    const dependencyPackage = Object.assign<DependencyPackage, NodePackage>(
      new DependencyPackage(),
      super.clone()
    ) as DependencyPackage;

    dependencyPackage.mode = this.mode;
    dependencyPackage.syncDirectories = this.syncDirectories;
    dependencyPackage.disabled = this.disabled;
    dependencyPackage.color = this.color;
    return dependencyPackage;
  }
}

import { DependencyMode } from '@renderer/models/DependencyConstants';

import NodePackage from './NodePackage';

export default class DependencyPackage extends NodePackage {
  public mode: (typeof DependencyMode)[keyof typeof DependencyMode] =
    DependencyMode.BUILD;

  public srcSyncDirectories?: string[]; //TODO: crate a new mode like { srcDir: string, relativeTargetSyncDir?: string }

  public clone(): DependencyPackage {
    const dependencyPackage = Object.assign<DependencyPackage, NodePackage>(
      new DependencyPackage(),
      super.clone()
    ) as DependencyPackage;

    dependencyPackage.mode = this.mode;
    dependencyPackage.srcSyncDirectories = this.srcSyncDirectories;
    return dependencyPackage;
  }
}

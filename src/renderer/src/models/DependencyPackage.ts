import { DependencyMode } from '@renderer/models/DependencyConstants';

import NodePackage from './NodePackage';

export default class DependencyPackage extends NodePackage {
  public mode: (typeof DependencyMode)[keyof typeof DependencyMode] =
    DependencyMode.BUILD;

  public clone(): DependencyPackage {
    const dependencyPackage = Object.assign<DependencyPackage, NodePackage>(
      new DependencyPackage(),
      super.clone()
    ) as DependencyPackage;

    dependencyPackage.mode = this.mode;
    return dependencyPackage;
  }
}

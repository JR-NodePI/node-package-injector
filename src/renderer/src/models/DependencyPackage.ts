import { DependencyMode } from '@renderer/models/DependencyConstants';

import TargetPackage from './TargetPackage';

export default class DependencyPackage extends TargetPackage {
  public mode: (typeof DependencyMode)[keyof typeof DependencyMode] =
    DependencyMode.BUILD;

  public clone(): DependencyPackage {
    const dependencyPackage = Object.assign<DependencyPackage, TargetPackage>(
      new DependencyPackage(),
      super.clone()
    ) as DependencyPackage;

    dependencyPackage.mode = this.mode;
    return dependencyPackage;
  }
}

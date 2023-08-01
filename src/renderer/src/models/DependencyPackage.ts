import { DependencyMode } from '@renderer/models/DependencyConstants';

import TargetPackage from './TargetPackage';

export default class DependencyPackage extends TargetPackage {
  public mode: (typeof DependencyMode)[keyof typeof DependencyMode] =
    DependencyMode.BUILD;
  public script?: string;

  public relatedDependencyConfigIds?: string[];

  public clone(): DependencyPackage {
    const clone: DependencyPackage = Object.assign(
      new DependencyPackage(),
      super.clone()
    );

    clone.mode = this.mode;
    clone.script = this.script;
    clone.relatedDependencyConfigIds = this.relatedDependencyConfigIds;

    return clone;
  }
}

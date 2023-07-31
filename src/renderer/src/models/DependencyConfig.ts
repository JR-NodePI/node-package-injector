import { DependencyMode } from '@renderer/models/DependencyConfigConstants';

import PackageConfig from './PackageConfig';

export default class DependencyConfig extends PackageConfig {
  public mode: (typeof DependencyMode)[keyof typeof DependencyMode] =
    DependencyMode.BUILD;

  public relatedDependencyConfigIds?: string[];

  public clone(): DependencyConfig {
    const clone: DependencyConfig = Object.assign(
      new DependencyConfig(),
      super.clone()
    );

    clone.mode = this.mode;
    clone.relatedDependencyConfigIds = this.relatedDependencyConfigIds;

    return clone;
  }
}

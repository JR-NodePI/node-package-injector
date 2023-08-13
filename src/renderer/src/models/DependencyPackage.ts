import { DependencyMode } from '@renderer/models/DependencyConstants';

import TargetPackage from './TargetPackage';

export default class DependencyPackage extends TargetPackage {
  public mode: (typeof DependencyMode)[keyof typeof DependencyMode] =
    DependencyMode.BUILD;

  public clone(): DependencyPackage {
    const dependencyPackage = new DependencyPackage();
    dependencyPackage.resetId();
    dependencyPackage.cwd = this.cwd;
    dependencyPackage.isValidPackage = this.isValidPackage;
    dependencyPackage.performGitPull = this.performGitPull;
    dependencyPackage.scripts = this.scripts.map(script => script.clone());
    dependencyPackage.mode = this.mode;
    return dependencyPackage;
  }
}

import { v4 as uuid } from 'uuid';

import { type PackageInstallModeValue } from './PackageInstallMode';

export default class TargetPackage {
  public id = uuid();

  public cwd?: string;
  public isValidPackage = false;
  public performGitPull = false;
  public performInstallMode?: PackageInstallModeValue;

  public clone(): TargetPackage {
    const clone = new TargetPackage();

    clone.id = this.id;

    clone.cwd = this.cwd;
    clone.isValidPackage = this.isValidPackage;
    clone.performGitPull = this.performGitPull;
    clone.performInstallMode = this.performInstallMode;

    return clone;
  }
}

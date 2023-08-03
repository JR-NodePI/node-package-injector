import { type PackageScript } from '@renderer/models/PackageScriptsTypes';
import { v4 as uuid } from 'uuid';

export default class TargetPackage {
  public id = uuid();

  public cwd?: string;
  public isValidPackage = false;
  public performGitPull = false;
  public scripts: PackageScript[] = [];

  public clone(): TargetPackage {
    const clone = new TargetPackage();

    clone.id = this.id;

    clone.cwd = this.cwd;
    clone.isValidPackage = this.isValidPackage;
    clone.performGitPull = this.performGitPull;
    clone.scripts = this.scripts;

    return clone;
  }
}

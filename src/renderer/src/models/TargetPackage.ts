import type { PackageScript } from './PackageScript';

export default class TargetPackage {
  public readonly id = crypto.randomUUID();
  public cwd?: string;
  public isValidPackage = false;
  public performGitPull = false;
  public scripts: PackageScript[] = [];
}

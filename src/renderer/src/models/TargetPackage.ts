import type PackageScript from './PackageScript';

export default class TargetPackage {
  private _id = crypto.randomUUID();

  public get id(): string {
    return this._id;
  }
  public cwd?: string;
  public isValidPackage = false;
  public performGitPull = false;
  public scripts: PackageScript[] = [];

  public clone(): TargetPackage {
    const targetPackage = new TargetPackage();
    targetPackage._id = this._id;
    targetPackage.cwd = this.cwd;
    targetPackage.isValidPackage = this.isValidPackage;
    targetPackage.performGitPull = this.performGitPull;
    targetPackage.scripts = this.scripts.map(script => script.clone());
    return targetPackage;
  }
}

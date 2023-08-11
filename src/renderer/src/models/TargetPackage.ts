import type { PackageScript } from './PackageScript';

export default class TargetPackage {
  private _id = crypto.randomUUID();

  public get id(): string {
    return this._id;
  }
  public cwd?: string;
  public isValidPackage = false;
  public performGitPull = false;
  public scripts: PackageScript[] = [];

  public resetId(): void {
    this._id = crypto.randomUUID();
  }
}

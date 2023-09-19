import type PackageScript from './PackageScript';

export default class NodePackage {
  private _id = crypto.randomUUID();

  public get id(): string {
    return this._id;
  }
  public cwd?: string;
  public isValidPackage = false;
  public performGitPull = false;
  public scripts?: PackageScript[];

  public clone(): NodePackage {
    const nodePackage = new NodePackage();
    nodePackage._id = this._id;
    nodePackage.cwd = this.cwd;
    nodePackage.isValidPackage = this.isValidPackage;
    nodePackage.performGitPull = this.performGitPull;
    nodePackage.scripts = this.scripts?.map(script => script.clone());
    return nodePackage;
  }
}

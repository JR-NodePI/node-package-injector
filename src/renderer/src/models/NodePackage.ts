import type PackageScript from './PackageScript';

export default class NodePackage {
  private _id = crypto.randomUUID();

  public get id(): string {
    return this._id;
  }
  public cwd?: string;
  public packageName?: string;
  public isValidPackage = false;
  public scripts?: PackageScript[];
  public afterBuildScripts?: PackageScript[];

  public clone(): NodePackage {
    const nodePackage = new NodePackage();
    nodePackage._id = this._id;
    nodePackage.cwd = this.cwd;
    nodePackage.packageName = this.packageName;
    nodePackage.isValidPackage = this.isValidPackage;
    nodePackage.scripts = this.scripts?.map(script => script.clone());
    nodePackage.afterBuildScripts = this.afterBuildScripts?.map(script =>
      script.clone()
    );
    return nodePackage;
  }
}

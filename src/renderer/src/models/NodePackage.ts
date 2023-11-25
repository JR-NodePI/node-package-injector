import NodeService from '@renderer/services/NodeService/NodeService';

import type PackageScript from './PackageScript';

export default class NodePackage {
  private _id = crypto.randomUUID();
  private _version = `${
    NodeService.FAKE_PACKAGE_VERSION
  }-${crypto.randomUUID()}`;

  public get id(): string {
    return this._id;
  }
  public get version(): string {
    return this._version;
  }
  public cwd?: string;
  public packageName?: string;
  public isValidPackage = false;
  public scripts?: PackageScript[];
  public postBuildScripts?: PackageScript[];

  public clone(): NodePackage {
    const nodePackage = new NodePackage();
    nodePackage._id = this._id;
    nodePackage._version = this._version;
    nodePackage.cwd = this.cwd;
    nodePackage.packageName = this.packageName;
    nodePackage.isValidPackage = this.isValidPackage;
    nodePackage.scripts = this.scripts?.map(script => script.clone());
    nodePackage.postBuildScripts = this.postBuildScripts?.map(script =>
      script.clone()
    );
    return nodePackage;
  }
}

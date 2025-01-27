import PackageScript from './PackageScript';

export default class LastSelectedScripts {
  public packageName: string;
  public targetScripts?: PackageScript[];
  public targetPostBuildScripts?: PackageScript[];
  public dependencyPreBuildScripts?: PackageScript[];
  public dependencyScripts?: PackageScript[];

  constructor(packageName: string) {
    this.packageName = packageName;
  }

  public clone(): LastSelectedScripts {
    const nodePackage = new LastSelectedScripts(this.packageName);
    nodePackage.targetScripts = this.targetScripts?.map(script =>
      script.clone()
    );
    nodePackage.targetPostBuildScripts = this.targetPostBuildScripts?.map(
      script => script.clone()
    );
    nodePackage.dependencyPreBuildScripts = this.dependencyPreBuildScripts?.map(
      script => script.clone()
    );
    nodePackage.dependencyScripts = this.dependencyScripts?.map(script =>
      script.clone()
    );
    return nodePackage;
  }
}

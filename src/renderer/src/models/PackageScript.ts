export default class PackageScript {
  private _id = crypto.randomUUID();

  public get id(): string {
    return this._id;
  }
  public scriptName?: string;
  public scriptValue?: string;

  public resetId(): void {
    this._id = crypto.randomUUID();
  }

  public clone(): PackageScript {
    const packageScript = new PackageScript();
    packageScript.scriptName = this.scriptName;
    packageScript.scriptValue = this.scriptValue;
    return packageScript;
  }
}

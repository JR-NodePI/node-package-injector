export default class PackageScript {
  private _id = crypto.randomUUID();

  public get id(): string {
    return this._id;
  }
  public scriptName = '';
  public scriptValue = '';

  constructor(scriptName?: string, scriptValue?: string) {
    this.scriptName = scriptName ?? '';
    this.scriptValue = scriptValue ?? '';
  }

  public clone(): PackageScript {
    const packageScript = new PackageScript();
    packageScript._id = this._id;
    packageScript.scriptName = this.scriptName;
    packageScript.scriptValue = this.scriptValue;
    return packageScript;
  }
}

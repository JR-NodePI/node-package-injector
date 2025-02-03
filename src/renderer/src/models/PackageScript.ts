export type ScriptsType = 'scripts' | 'postBuildScripts' | 'preBuildScripts';

export default class PackageScript {
  private _id = crypto.randomUUID();

  public get id(): string {
    return this._id;
  }
  public scriptName = '';
  public scriptValue = '';
  public disabled = false;

  constructor(scriptName?: string, scriptValue?: string, disabled?: boolean) {
    this.scriptName = scriptName ?? '';
    this.scriptValue = scriptValue ?? '';
    this.disabled = Boolean(disabled);
  }

  public clone(): PackageScript {
    const packageScript = new PackageScript();
    packageScript._id = this._id;
    packageScript.scriptName = this.scriptName;
    packageScript.scriptValue = this.scriptValue;
    packageScript.disabled = this.disabled;
    return packageScript;
  }
}

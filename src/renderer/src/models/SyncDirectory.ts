export default class SyncDirectory {
  public srcPath: string;
  public targetPath?: string;

  constructor(srcPath: string, targetPath?: string) {
    this.srcPath = srcPath;
    this.targetPath = targetPath;
  }
}

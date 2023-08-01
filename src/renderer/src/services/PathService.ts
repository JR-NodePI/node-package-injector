import WSLService, { WSL_DOMAIN } from './WSLService';

export default class PathService {
  public static isWSL(path?: string): boolean {
    return (
      (path ?? '').startsWith(WSL_DOMAIN) ||
      (path ?? '').startsWith(`\\\\${WSL_DOMAIN}`)
    );
  }

  public static getPath(pathDirectories: string[]): string {
    if (pathDirectories.length === 0) {
      return '';
    }

    let path = window.api.path.join(...pathDirectories, '/');

    if (window.api.os.platform() !== 'win32') {
      path = window.api.path.join('/', path);
    }

    if (PathService.isWSL(pathDirectories?.[0] ?? '')) {
      path = `\\\\${path}`;
    }

    return path;
  }

  public static getPreviousPath(path?: string): string {
    if (path) {
      return path.split(/\/|\\/).filter(Boolean).slice(0, -1).join('/');
    }

    return window.api.os.homedir();
  }

  public static getPathDirectories(path?: string): string[] {
    return (path ?? '')
      .split(/[/\\]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  public static async getHomePath(setWSL?: boolean): Promise<string> {
    const homedir = window.api.os.homedir();
    return setWSL ? await WSLService.getSWLHomePath(homedir) : homedir;
  }

  public static getExtraResourcesScriptPath(scriptFileName: string): string {
    return window.api.path
      .join(window.api.extraResourcesPath, '/', scriptFileName)
      .replace(
        /^[a-z]{1}:/gi,
        match => `/mnt/${match.toLowerCase().replace(':', '')}`
      )
      .replace(/\\/gi, '/');
  }
}

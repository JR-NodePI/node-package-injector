import TerminalService from './TerminalService';
import WSLService, { WSL_DOMAIN } from './WSLService';

export default class PathService {
  public static get splitPattern(): RegExp {
    return /\/|\\/g;
  }

  public static isWSL(path?: string): boolean {
    return (
      (path ?? '').startsWith(WSL_DOMAIN) ||
      (path ?? '').startsWith(`\\\\${WSL_DOMAIN}`)
    );
  }

  public static getPath(
    pathDirectories: string | string[],
    isWSLActive?: boolean
  ): string {
    if (pathDirectories.length === 0) {
      return '';
    }

    let path = Array.isArray(pathDirectories)
      ? window.api.path.join(...pathDirectories, '/')
      : pathDirectories;

    if (window.api.os.platform() !== 'win32' || isWSLActive) {
      path = window.api.path.join('/', path);
    }

    if (PathService.isWSL(pathDirectories?.[0] ?? '')) {
      path = `\\\\${path}`;
    }

    return path;
  }

  public static getPreviousPath(path?: string): string {
    if (path) {
      return window.api.path.join(
        ...path.split(PathService.splitPattern).filter(Boolean).slice(0, -1)
      );
    }

    return window.api.os.homedir();
  }

  public static getPathDirectories(path?: string): string[] {
    return (path ?? '')
      .split(/[/\\]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  public static getDirName(path?: string): string {
    const dirs = PathService.getPathDirectories(path);
    return dirs.pop() ?? '';
  }

  public static async getHomePath(
    isWSLActive?: boolean,
    traceOnTime?: boolean
  ): Promise<string> {
    const homedir = window.api.os.homedir();
    return isWSLActive
      ? await WSLService.getSWLHomePath(homedir, traceOnTime)
      : homedir;
  }

  public static normalizeWin32Path(path: string): string {
    return path
      .replace(
        /^[a-z]{1}:/gi,
        match => `/mnt/${match.toLowerCase().replace(':', '')}`
      )
      .replace(/\\/gi, '/');
  }

  public static getExtraResourcesScriptPath(scriptFileName: string): string {
    return PathService.normalizeWin32Path(
      window.api.path.join(window.api.extraResourcesPath, '/', scriptFileName)
    );
  }

  public static async getTmpDir({
    isWSLActive,
    skipWSLRoot,
    traceOnTime,
  }: {
    isWSLActive?: boolean;
    skipWSLRoot?: boolean;
    traceOnTime?: boolean;
  }): Promise<string> {
    if (window.api.os.platform() !== 'win32') {
      return window.api.os.tmpdir();
    }

    if (isWSLActive) {
      const cwd = await PathService.getHomePath(isWSLActive, traceOnTime);
      const { content: tmpDir = '' } = await TerminalService.executeCommand({
        command: 'systemd-path',
        args: ['temporary'],
        traceOnTime: true,
        cwd,
      });

      return skipWSLRoot
        ? tmpDir
        : await WSLService.getSWLRoot(cwd, tmpDir, traceOnTime);
    }

    return window.api.os.tmpdir();
  }
}

import os from 'os';
import path from 'path';

import { extraResourcesPath } from '../constants';
import WSLService, { WSL_DOMAIN } from '../WSL/WSLService';

export default class PathService {
  public static get splitPattern(): RegExp {
    return /\/|\\/g;
  }

  public static isWSL(dirPath?: string): boolean {
    return (
      (dirPath ?? '').startsWith(WSL_DOMAIN) ||
      (dirPath ?? '').startsWith(`\\\\${WSL_DOMAIN}`)
    );
  }

  public static getPath(
    pathDirectories: string | string[],
    isWSLActive?: boolean
  ): string {
    if (pathDirectories.length === 0) {
      return '';
    }

    let dirPath = Array.isArray(pathDirectories)
      ? path.join(...pathDirectories, '/')
      : pathDirectories;

    if (os.platform() !== 'win32') {
      dirPath = path.join('/', dirPath);
    }

    if (PathService.isWSL(pathDirectories?.[0] ?? '') || isWSLActive) {
      dirPath = `\\\\${dirPath}`;
    }

    return dirPath;
  }

  public static getPreviousPath(dirPath?: string): string {
    if (dirPath) {
      return path.join(
        ...dirPath.split(PathService.splitPattern).filter(Boolean).slice(0, -1)
      );
    }

    return os.homedir();
  }

  public static getPathDirectories(path?: string): string[] {
    return (path ?? '')
      .split(/[/\\]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  public static async getHomePath(isWSLActive?: boolean): Promise<string> {
    const homedir = os.homedir();
    return isWSLActive ? await WSLService.getSWLHomePath(homedir) : homedir;
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
      path.join(extraResourcesPath, 'bashScripts', scriptFileName)
    );
  }
}

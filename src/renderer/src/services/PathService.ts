import { WSL_DOMAIN } from './WSLService';

export default class PathService {
  public static isWSL(path: string): boolean {
    return path.startsWith(WSL_DOMAIN);
  }

  public static getPath(pathDirectories: string[]): string {
    let path = window.api.path.join(...pathDirectories, '/');

    if (PathService.isWSL(path)) {
      path = `\\\\${path}`;
    }

    return path;
  }
}

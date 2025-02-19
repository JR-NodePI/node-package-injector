import os from 'os';

import TerminalService from '../Terminal/TerminalService';

export const WSL_DOMAIN = 'wsl$';

export default class WSLService {
  private static cacheDistroName = {
    lastUpdate: 0,
    value: '',
  };

  private static async getSWLDistroName(cwd: string): Promise<string> {
    const isSWLCompatible = ['win32'].includes(os.platform());

    if (!isSWLCompatible) {
      return '';
    }

    if (Date.now() - WSLService.cacheDistroName.lastUpdate < 30000) {
      return WSLService.cacheDistroName.value;
    }

    try {
      const { content } = await TerminalService.executeCommand({
        command: 'wsl',
        args: ['-l', '--all'],
        cwd,
        skipWSL: true,
        groupLogsLabel: 'WSL get distro name',
      });

      const patternDistroMatch = /\([^)]+\)/;
      const distroRaw = (content ?? '')
        .trim()
        .split(/[\n\r]/g)
        .find(item => patternDistroMatch.test(item));

      if (distroRaw) {
        const distro = distroRaw.replace(patternDistroMatch, '').trim();
        WSLService.cacheDistroName.lastUpdate = Date.now();
        WSLService.cacheDistroName.value = distro;
        return distro;
      }

      return '';
    } catch {
      return '';
    }
  }

  public static async getSWLRoot(cwd: string, path: string): Promise<string> {
    const wslDistro = await WSLService.getSWLDistroName(cwd);

    if (wslDistro) {
      return `\\\\${WSL_DOMAIN}\\${wslDistro}${path.replace(/\//g, '\\')}`;
    }

    return '';
  }

  public static async cleanSWLRoot(cwd: string, path: string): Promise<string> {
    const wslDistro = await WSLService.getSWLDistroName(cwd);

    if (wslDistro) {
      return path
        .replace(/\\/g, '/')
        .replace(
          new RegExp(
            `(!?//${WSL_DOMAIN.replace(/\$/gi, '\\$')}/${wslDistro})(.+)`,
            'gi'
          ),
          '$2'
        );
    }

    return path;
  }

  public static async getSWLHomePath(cwd: string): Promise<string> {
    const wslDistro = await WSLService.getSWLDistroName(cwd);

    if (wslDistro) {
      let username = '';

      try {
        const { content } = await TerminalService.executeCommand({
          command: 'wsl',
          args: ['-e', 'ls', '/home'],
          cwd,
          skipWSL: true,
          groupLogsLabel: 'WSL get home path',
        });

        username = (content ?? '').split(/[\n\r]/g)[0] || '';
      } catch {
        username = '';
      }

      return username ? WSLService.getSWLRoot(cwd, `/home/${username}`) : '';
    }

    return '';
  }

  public static cacheClean(): void {
    WSLService.cacheDistroName = {
      lastUpdate: 0,
      value: '',
    };
  }
}

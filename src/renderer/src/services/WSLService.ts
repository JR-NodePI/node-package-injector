import TerminalService from './TerminalService';

export const WSL_DOMAIN = 'wsl$';

export default class WSLService {
  private static async getSWLDistroName(cwd: string): Promise<string> {
    const isSWLCompatible = ['win32', 'cygwin'].includes(
      window.api.os.platform()
    );

    if (!isSWLCompatible) {
      return '';
    }

    try {
      const { content } = await TerminalService.executeCommand({
        command: 'wsl',
        args: ['-l', '--all'],
        cwd,
        skipWSL: true,
      });

      const patternDistroMatch = /\([^)]+\)/;
      const distro = (content ?? '')
        .trim()
        .split(/[\n\r]/g)
        .find(item => patternDistroMatch.test(item));

      if (distro) {
        return distro.replace(patternDistroMatch, '').trim();
      }

      return '';
    } catch {
      return '';
    }
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
        });

        username = (content ?? '').split(/[\n\r]/g)[0] || '';
      } catch {
        username = '';
      }

      return `\\\\${WSL_DOMAIN}\\${wslDistro}\\home\\${username}`;
    }

    return '';
  }
}

import TerminalService from './TerminalService';

const cleanWSLOutput = (output: string): string => output.replace(/[^a-z0-9-\n\s\r]/gi, '');

export const WSL_DOMAIN = 'wsl$';

export default class WSLService {
  public static async getSWLDistroName(cwd: string): Promise<string> {
    try {
      const wslOutput = await TerminalService.executeCommand({
        command: 'wsl',
        args: ['-l', '-q', '--running'],
        cwd,
        skipWSL: true,
      });

      return cleanWSLOutput(wslOutput).trim();
    } catch {
      return '';
    }
  }

  public static async getSWLHomePath(cwd: string): Promise<string> {
    const wslDistro = await WSLService.getSWLDistroName(cwd);

    if (wslDistro) {
      let username = '';

      try {
        const wslOutput = await TerminalService.executeCommand({
          command: 'wsl',
          args: ['-e', 'ls', '/home'],
          cwd,
          skipWSL: true,
        });

        username = cleanWSLOutput(wslOutput).split(/[\n\r]/g)[0] || '';
      } catch {
        username = '';
      }

      return `\\\\${WSL_DOMAIN}\\${wslDistro}\\home\\${username}`;
    }

    return '';
  }

  public static getSWLPath(cwd: string): string {
    if (cwd.startsWith(WSL_DOMAIN)) {
      return `\\\\${cwd}`;
    }
    return cwd;
  }
}

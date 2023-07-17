import TerminalRepository from './TerminalRepository';
import {
  ExecuteCommandOutputType,
  type ExecuteCommandOptions,
  ExecuteCommandOutput,
} from './TerminalTypes';

/**
 * external script usage example:
 *
 * const path = window.api.path;
 * const script = path.join(window.api.extraResourcesPath, 'script.sh');
 *
 * await TerminalService.executeCommand({
 *  command: 'ls',
 *  args: ['-lh'],
 *  cwd: window.api.extraResourcesPath,
 * });
 */

let isWSL;

export default class TerminalService {
  static async executeCommand({ command, args = [], cwd }: ExecuteCommandOptions): Promise<string> {
    if (isWSL == null) {
      isWSL = false;
      isWSL = await TerminalService.checkWSL(cwd ?? '');
    }

    const finalCommand = isWSL ? 'wsl' : command;
    const finalArgs = isWSL ? ['-e', 'bash', command, ...args] : args;

    let outputs: ExecuteCommandOutput[] = [];

    try {
      outputs = await TerminalRepository.executeCommand({
        command: finalCommand,
        args: finalArgs,
        cwd,
      });
    } catch (error) {
      console.error(error);
      return '';
    }

    return outputs.reduce((value, output) => {
      switch (output.type) {
        case ExecuteCommandOutputType.STDERR:
        case ExecuteCommandOutputType.STDOUT:
          return value + output.data ?? '';
        case ExecuteCommandOutputType.CLOSE:
        case ExecuteCommandOutputType.EXIT:
        default:
          return value;
      }
    }, '');
  }

  private static async checkWSL(cwd: string): Promise<boolean> {
    if (process.platform === 'win32') {
      try {
        const wslOutput = await TerminalService.executeCommand({
          command: 'wsl',
          args: ['-e', 'bash', '--version'],
          cwd,
        });
        return wslOutput != null && wslOutput.includes('GNU bash');
      } catch (error) {
        return false;
      }
    }

    return false;
  }
}

import TerminalRepository from './TerminalRepository';
import {
  ExecuteCommandOutputType,
  type ExecuteCommandOptions,
  ExecuteCommandOutput,
} from './TerminalTypes';

export default class TerminalService {
  public static isWSL: boolean;
  public static async executeCommand({
    command,
    args = [],
    cwd,
    skipWSL = false,
  }: ExecuteCommandOptions): Promise<string> {
    if (TerminalService.isWSL == null) {
      TerminalService.isWSL = false;
      TerminalService.isWSL = await TerminalService.checkWSL(cwd ?? '');
    }

    const finalCommand = TerminalService.isWSL && !skipWSL ? 'wsl' : command;
    const finalArgs = TerminalService.isWSL && !skipWSL ? ['-e', command, ...args] : args;

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

  public static async checkWSL(cwd: string): Promise<boolean> {
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
}

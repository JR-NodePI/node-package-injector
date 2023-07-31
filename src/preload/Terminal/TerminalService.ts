import TerminalRepository from './TerminalRepository';
import {
  type ExecuteCommandOptions,
  ExecuteCommandOutput,
  ExecuteCommandOutputType,
} from './TerminalTypes';

export type TerminalResponse = {
  content?: string;
  error?: string;
};
export default class TerminalService {
  private static isTerminalInitialized: boolean;
  public static isWSLAvailable: boolean;

  private static async checkWSL(cwd: string): Promise<boolean> {
    const isSWLCompatible = ['win32', 'cygwin'].includes(process.platform);

    if (!isSWLCompatible) {
      return false;
    }

    try {
      const { content } = await TerminalService.executeCommand({
        command: 'wsl',
        args: ['-e', 'bash', '--version'],
        cwd,
      });

      return (content ?? '').includes('GNU bash');
    } catch (error) {
      return false;
    }
  }

  private static cacheExecuteCommand = new Map<
    string,
    Promise<ExecuteCommandOutput[]>
  >();
  public static async executeCommand({
    command,
    args = [],
    cwd,
    skipWSL = false,
  }: ExecuteCommandOptions): Promise<TerminalResponse> {
    if (TerminalService.isTerminalInitialized === false) {
      throw new Error('Terminal is not enabled');
    }

    if (TerminalService.isWSLAvailable == null) {
      TerminalService.isWSLAvailable = false;
      TerminalService.isWSLAvailable = await TerminalService.checkWSL(
        cwd ?? ''
      );
    }

    const finalCommand =
      TerminalService.isWSLAvailable && !skipWSL ? 'wsl' : command;
    const finalArgs =
      TerminalService.isWSLAvailable && !skipWSL
        ? ['-e', command, ...args]
        : args;

    let outputs: ExecuteCommandOutput[] = [];

    let promise = TerminalService.cacheExecuteCommand.get(
      `${cwd}-${finalCommand}-${finalArgs.join('-')}`
    );
    if (!promise) {
      promise = TerminalRepository.executeCommand({
        command: finalCommand,
        args: finalArgs,
        cwd,
      });
    }

    try {
      outputs = await promise;
    } catch (error) {
      return { error: (error as Error).message ?? '' };
    }

    const content = outputs.reduce((value, output) => {
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

    return { content };
  }

  public static async init(cwd: string): Promise<boolean> {
    if (TerminalService.isTerminalInitialized) {
      return true;
    }

    const expectedOutput = 'TERMINAL_INIT';

    try {
      const outputs = await TerminalRepository.executeCommand({
        command: 'echo',
        args: [`${expectedOutput}`],
        cwd,
        skipWSL: true,
      });

      const output = (outputs[0]?.data ?? '').toString().trim();

      TerminalService.isTerminalInitialized = output === expectedOutput;

      return TerminalService.isTerminalInitialized;
    } catch {
      return false;
    }
  }
}

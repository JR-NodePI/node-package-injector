import { ExecuteCommandOutputType } from './TerminalConstants';
import TerminalRepository from './TerminalRepository';
import {
  type ExecuteCommandOptions,
  ExecuteCommandOutput,
} from './TerminalTypes';

export type TerminalResponse = {
  content?: string;
  error?: string;
};
export default class TerminalService {
  private static isTerminalInitialized: boolean;
  public static isWSLAvailable: boolean;

  private static async checkWSL(
    cwd: string,
    addIcons?: boolean
  ): Promise<boolean> {
    const isSWLCompatible = ['win32', 'cygwin'].includes(process.platform);

    if (!isSWLCompatible) {
      return false;
    }

    try {
      const outputs = await TerminalRepository.executeCommand({
        addIcons,
        args: ['-e', 'bash', '--version'],
        command: 'wsl',
        cwd,
        groupLogsLabel: 'WSL CHECK',
        syncMode: true,
      });

      const output = (outputs[0]?.data ?? '').toString().trim();

      return output.includes('linux');
    } catch (error) {
      return false;
    }
  }

  private static async initInitials(cwd: string): Promise<boolean> {
    const expectedOutput = 'TERMINAL_INIT';

    try {
      const outputs = await TerminalRepository.executeCommand({
        args: [`${expectedOutput}`],
        command: 'echo',
        cwd,
        groupLogsLabel: '> INIT',
        syncMode: true,
      });

      const output = (outputs[0]?.data ?? '').toString().trim();

      return output === expectedOutput;
    } catch {
      return false;
    }
  }

  private static cacheExecuteCommand = new Map<
    string,
    Promise<ExecuteCommandOutput[]>
  >();
  public static async executeCommand({
    abortController,
    addIcons,
    args = [],
    command,
    cwd,
    groupLogsLabel,
    ignoreStderrErrors = false,
    resolveTimeout,
    resolveTimeoutAfterFirstOutput,
    skipWSL = false,
    syncMode,
    traceOnTime = false,
  }: ExecuteCommandOptions & {
    skipWSL?: boolean;
  }): Promise<TerminalResponse> {
    if (
      TerminalService.isTerminalInitialized === false ||
      TerminalService.isWSLAvailable == null
    ) {
      throw new Error('Terminal is not enabled');
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
        abortController,
        addIcons,
        args: finalArgs,
        command: finalCommand,
        cwd,
        groupLogsLabel,
        ignoreStderrErrors,
        resolveTimeout,
        resolveTimeoutAfterFirstOutput,
        syncMode,
        traceOnTime,
      });
    }

    try {
      outputs = await promise;
    } catch (error) {
      return { error: (error as Error).message ?? '' };
    }

    const content = outputs.reduce((value, output) => {
      switch (output.type) {
        case ExecuteCommandOutputType.STDERR_WARN:
        case ExecuteCommandOutputType.STDOUT:
          return value + output.data ?? '';
        case ExecuteCommandOutputType.STDERR_ERROR:
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

    if (TerminalService.isTerminalInitialized == null) {
      TerminalService.isTerminalInitialized =
        await TerminalService.initInitials(cwd);
    }

    if (TerminalService.isWSLAvailable == null) {
      TerminalService.isWSLAvailable = await TerminalService.checkWSL(cwd);
    }

    return TerminalService.isTerminalInitialized;
  }
}

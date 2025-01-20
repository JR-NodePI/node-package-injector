import retryPromise from './helpers/retryPromise';
import PathService from './PathService';
import TerminalService, { type TerminalResponse } from './TerminalService';

const isValidBranch = (line: string): boolean => !line.includes('HEAD -');

const getCleanBranchName = (line: string): string =>
  line.replace(new RegExp(`(.*remotes/origin/|^\\* *|^ *)(.*)`), '$2');

export default class GitService {
  static async executeCommand(
    cwd: string,
    gitCommand: string | string[]
  ): Promise<TerminalResponse> {
    return await TerminalService.executeCommand({
      args: [gitCommand].flat(),
      command: 'git',
      cwd,
      groupLogsLabel: 'GIT -> command',
    });
  }

  static async checkout(
    cwd: string,
    branch: string
  ): Promise<TerminalResponse> {
    return await TerminalService.executeCommand({
      command: 'git',
      args: ['checkout', branch],
      cwd,
      groupLogsLabel: 'GIT -> checkout',
    });
  }

  static async pull(cwd: string): Promise<TerminalResponse> {
    return await TerminalService.executeCommand({
      command: 'git',
      args: ['pull'],
      cwd,
      groupLogsLabel: 'GIT -> pull',
    });
  }

  private static async _getCurrentBranch({
    cwd,
    abortController,
    ignoreStderrErrors,
  }: {
    cwd: string;
    abortController?: AbortController;
    ignoreStderrErrors?: boolean;
  }): Promise<string> {
    const { content } = await TerminalService.executeCommand({
      abortController,
      args: ['rev-parse', '--abbrev-ref', 'HEAD'],
      command: 'git',
      cwd,
      groupLogsLabel: `GIT -> get current branch`,
      ignoreStderrErrors,
    });
    const value = (content ?? '').trim();

    const hasEmptyOrError = !value || value.includes('fatal:');

    if (hasEmptyOrError && value.includes('not a git repository')) {
      return '';
    }

    if (hasEmptyOrError) {
      throw new Error(value);
    }

    return value;
  }

  static async getCurrentBranch(
    params: Parameters<typeof GitService._getCurrentBranch>[0]
  ): Promise<string> {
    const result = await retryPromise<string>(() =>
      GitService._getCurrentBranch(params)
    );
    return result ?? '';
  }

  static async getBranches(
    cwd: string,
    abortController?: AbortController
  ): Promise<string[]> {
    const { content } = await TerminalService.executeCommand({
      command: 'git',
      args: ['branch', '-l', '-a'],
      cwd,
      abortController,
      groupLogsLabel: 'GIT -> get branches',
    });

    const value = (content ?? '')
      .split('\n')
      .map(line => (isValidBranch(line) ? getCleanBranchName(line) : ''))
      .filter((value, index, array) => value && array.indexOf(value) === index)
      .toSorted();

    return value;
  }

  static async gitignoreAdd(
    cwd: string,
    paths: string[],
    abortController?: AbortController
  ): Promise<TerminalResponse> {
    return await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('node_pi_gitignore_add.sh'),
        ...paths.map(cwd => `"${cwd}"`),
      ],
      cwd,
      abortController,
      groupLogsLabel: 'GIT -> add to git ignore',
    });
  }
}

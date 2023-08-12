import TerminalService, { type TerminalResponse } from './TerminalService';

const REMOTE_BRANCH_PATTERN = new RegExp(`(.*remotes/origin/)(.*)`);

const isValidBranch = (line: string): boolean =>
  REMOTE_BRANCH_PATTERN.test(line) && !line.includes('HEAD -');

const getLocalBranch = (line: string): string =>
  line.replace(REMOTE_BRANCH_PATTERN, '$2');

export default class GitService {
  static async fetch(cwd: string): Promise<TerminalResponse> {
    return await TerminalService.executeCommand({
      command: 'git',
      args: ['fetch'],
      cwd,
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
    });
  }

  static async pull(cwd: string): Promise<TerminalResponse> {
    return await TerminalService.executeCommand({
      command: 'git',
      args: ['pull'],
      cwd,
    });
  }

  static async getCurrentBranch(
    cwd: string,
    abortController?: AbortController,
    ignoreStderrErrors?: boolean
  ): Promise<string> {
    const { content } = await TerminalService.executeCommand({
      command: 'git',
      args: ['branch', '--show-current'],
      cwd,
      abortController,
      ignoreStderrErrors,
    });
    const value = (content ?? '').trim();
    return value;
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
    });
    const value = (content ?? '')
      .split('\n')
      .map(line => (isValidBranch(line) ? getLocalBranch(line) : ''))
      .filter(value => value)
      .toSorted();
    return value;
  }

  static async checkGit(
    cwd: string,
    abortController?: AbortController
  ): Promise<boolean> {
    try {
      const branch = await GitService.getCurrentBranch(
        cwd,
        abortController,
        true
      );
      return Boolean(branch);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return false;
    }
  }
}

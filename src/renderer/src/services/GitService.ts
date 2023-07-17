import TerminalService from './TerminalService';

const REMOTE_BRANCH_PATTERN = new RegExp(`(.*remotes/origin/)(.*)`);

const isValidBranch = (line: string): boolean =>
  REMOTE_BRANCH_PATTERN.test(line) && !line.includes('HEAD ->');

const getLocalBranch = (line: string): string => line.replace(REMOTE_BRANCH_PATTERN, '$2');

export default class GitService {
  static async getCurrentBranch(cwd: string): Promise<string> {
    const branch = await TerminalService.executeCommand({
      command: 'git',
      args: ['branch', '--show-current'],
      cwd,
    });

    return branch.trim();
  }

  static async getBranches(cwd: string): Promise<string[]> {
    const output = await TerminalService.executeCommand({
      command: 'git',
      args: ['branch', '-l', '-a'],
      cwd,
    });

    const branchList = output
      .split('\n')
      .map(line => (isValidBranch(line) ? getLocalBranch(line) : ''))
      .filter(value => value)
      .sort();

    return branchList;
  }

  static async checkGit(cwd: string): Promise<boolean> {
    try {
      const branch = await GitService.getCurrentBranch(cwd);
      return Boolean(branch.trim());
    } catch (error) {
      return false;
    }
  }
}

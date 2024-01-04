import { describe, expect, it, Mocked, vi } from 'vitest';

import GetService from '../GitService';
import TerminalService from '../TerminalService';

vi.mock('../TerminalService');

const TerminalServiceMocked = TerminalService as Mocked<typeof TerminalService>;

describe('GitService', () => {
  beforeEach(vi.clearAllMocks);

  it('should call TerminalService.executeCommand with git command', async () => {
    const gitCommand = ['command1', 'command2'];
    const cwd = 'test cwd';

    await GetService.executeCommand(cwd, gitCommand);

    expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
    expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
      command: 'git',
      args: gitCommand,
      cwd,
    });
  });

  it('should call TerminalService.executeCommand with checkout command', async () => {
    const cwd = 'test cwd';
    const branch = 'feature/test_branch';

    await GetService.checkout(cwd, branch);

    expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
    expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
      command: 'git',
      args: ['checkout', branch],
      cwd,
    });
  });

  it('should call TerminalService.executeCommand with pull command', async () => {
    const cwd = 'test cwd';

    await GetService.pull(cwd);

    expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
    expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
      command: 'git',
      args: ['pull'],
      cwd,
    });
  });

  describe('getCurrentBranch', () => {
    it('should call TerminalService.executeCommand with default params and return content', async () => {
      TerminalServiceMocked.executeCommand.mockResolvedValueOnce({
        content: undefined,
      });

      const cwd = 'test cwd';

      const result = await GetService.getCurrentBranch({ cwd });

      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
        command: 'git',
        args: ['rev-parse', '--abbrev-ref', 'HEAD'],
        cwd,
      });
      expect(result).toBe('');
    });

    it('should call TerminalService.executeCommand with params and return content', async () => {
      TerminalServiceMocked.executeCommand.mockResolvedValueOnce({
        content: `
          Windows subsystem distributions for Linux:
          docker-desktop
          docker-desktop-data
        `,
      });

      const cwd = 'test cwd';
      const abortController = new AbortController();
      const ignoreStderrErrors = false;

      const result = await GetService.getCurrentBranch({
        cwd,
        abortController,
        ignoreStderrErrors,
      });

      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
        command: 'git',
        args: ['rev-parse', '--abbrev-ref', 'HEAD'],
        cwd,
        abortController,
        ignoreStderrErrors,
      });
      expect(result).toBe(`Windows subsystem distributions for Linux:
          docker-desktop
          docker-desktop-data`);
    });
  });

  describe('getBranches', () => {
    it('should call TerminalService.executeCommand with default params and return content', async () => {
      TerminalServiceMocked.executeCommand.mockResolvedValueOnce({
        content: undefined,
      });

      const cwd = 'test cwd';

      const result = await GetService.getBranches(cwd);

      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
        command: 'git',
        args: ['branch', '-l', '-a'],
        cwd,
      });
      expect(result).toEqual([]);
    });

    it('should call TerminalService.executeCommand with params and return content', async () => {
      TerminalServiceMocked.executeCommand.mockResolvedValueOnce({
        content: `main
        remotes/origin/feature/1
        remotes/origin/feature/5
        remotes/origin/feature/3
        remotes/origin/feature/2
        `,
      });

      const cwd = 'test cwd';
      const abortController = new AbortController();

      const result = await GetService.getBranches(cwd, abortController);

      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
        command: 'git',
        args: ['branch', '-l', '-a'],
        cwd,
        abortController,
      });
      expect(result).toEqual([
        'feature/1',
        'feature/2',
        'feature/3',
        'feature/5',
      ]);
    });
  });

  describe('gitignoreAdd', () => {
    it('should call TerminalService.executeCommand with default params and return content', async () => {
      const response = {
        content: `example return`,
      };

      TerminalServiceMocked.executeCommand.mockResolvedValueOnce(response);

      const cwd = 'test cwd';
      const paths = [];
      const abortController = undefined;

      const result = await GetService.gitignoreAdd(cwd, paths);

      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
        command: 'bash',
        args: ['extraResources/bashScripts/node_pi_gitignore_add.sh'],
        cwd,
        abortController,
      });
      expect(result).toEqual(response);
    });

    it('should call TerminalService.executeCommand with params and return content', async () => {
      const response = {
        content: `more example return`,
      };

      TerminalServiceMocked.executeCommand.mockResolvedValueOnce(response);

      const cwd = 'test cwd';
      const paths = [];
      const abortController = new AbortController();

      const result = await GetService.gitignoreAdd(cwd, paths, abortController);

      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
        command: 'bash',
        args: ['extraResources/bashScripts/node_pi_gitignore_add.sh'],
        cwd,
        abortController,
      });
      expect(result).toEqual(response);
    });
  });

  describe('checkGit', () => {
    it('should call TerminalService.executeCommand with default params and return content', async () => {
      const cwd = 'test cwd';
      const abortController = undefined;

      const result = await GetService.checkGit(cwd);

      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
        command: 'git',
        args: ['rev-parse', '--abbrev-ref', 'HEAD'],
        cwd,
        abortController,
        ignoreStderrErrors: true,
      });
      expect(result).toBe(false);
    });

    it('should call TerminalService.executeCommand with params and return content', async () => {
      const cwd = 'test cwd';
      const abortController = new AbortController();

      const result = await GetService.checkGit(cwd, abortController);

      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
        command: 'git',
        args: ['rev-parse', '--abbrev-ref', 'HEAD'],
        cwd,
        abortController,
        ignoreStderrErrors: true,
      });
      expect(result).toBe(false);
    });

    it('should call TerminalService.executeCommand with params and return content with correct branch', async () => {
      const response = { content: 'feature/example-branch' };
      TerminalServiceMocked.executeCommand.mockResolvedValueOnce(response);

      const cwd = 'test cwd';
      const abortController = new AbortController();

      const result = await GetService.checkGit(cwd, abortController);

      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
        command: 'git',
        args: ['rev-parse', '--abbrev-ref', 'HEAD'],
        cwd,
        abortController,
        ignoreStderrErrors: true,
      });
      expect(result).toBe(true);
    });

    it('should call TerminalService.executeCommand with default params', async () => {
      const response = { error: 'Test error' };

      TerminalServiceMocked.executeCommand.mockRejectedValueOnce(response);
      const consoleErrorMock = vi.spyOn(console, 'error');

      const cwd = 'test cwd';
      const abortController = new AbortController();

      const result = await GetService.checkGit(cwd, abortController);

      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalServiceMocked.executeCommand).toHaveBeenCalledWith({
        command: 'git',
        args: ['rev-parse', '--abbrev-ref', 'HEAD'],
        cwd,
        abortController,
        ignoreStderrErrors: true,
      });
      expect(consoleErrorMock).toHaveBeenCalledTimes(1);
      expect(consoleErrorMock).toHaveBeenCalledWith(response);
      expect(result).toBe(false);
    });
  });
});

import { describe, expect, it, Mock, vi } from 'vitest';

import TerminalService from '../TerminalService';
import WSLService from '../WSLService';

vi.mock('../TerminalService');

describe('WSLService', () => {
  const cwd = '/mock/cwd';
  const wslDistroName = 'kali-linux';
  const getDistroNameWithExecuteCommandParams = {
    command: 'wsl',
    args: ['-l', '--all'],
    cwd,
    skipWSL: true,
  };
  const getHomePathWithExecuteCommandParams = {
    command: 'wsl',
    args: ['-e', 'ls', '/home'],
    cwd,
    skipWSL: true,
  };

  beforeEach(() => {
    WSLService.cacheClean();

    (TerminalService.executeCommand as Mock).mockResolvedValue({
      content: `
        Windows subsystem distributions for Linux:
        ${wslDistroName} (default)
        docker-desktop
        docker-desktop-data
      `,
    });

    vi.spyOn(window.api.os, 'platform').mockReturnValue('win32');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSWLRoot', () => {
    const linuxPath = '/Users/User/Documents/file.txt';

    it('should return the WSL path', async () => {
      const result = await WSLService.getSWLRoot(cwd, linuxPath);

      expect(result).toEqual(
        '\\\\wsl$\\kali-linux\\Users\\User\\Documents\\file.txt'
      );

      expect(window.api.os.platform).toHaveBeenCalledTimes(1);
      expect(window.api.os.platform).toHaveBeenCalledWith();

      expect(TerminalService.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalService.executeCommand).toHaveBeenCalledWith(
        getDistroNameWithExecuteCommandParams
      );
    });

    it('should empty when executeCommand fails', async () => {
      (TerminalService.executeCommand as Mock).mockRejectedValue(
        new Error('error')
      );

      const result = await WSLService.getSWLRoot(cwd, linuxPath);

      expect(result).toEqual('');
    });

    it('should empty when executeCommand returns content undefined', async () => {
      (TerminalService.executeCommand as Mock).mockResolvedValue({});
      const result = await WSLService.getSWLRoot(cwd, linuxPath);
      expect(result).toEqual('');
    });

    it('should return empty when there is no WSL SO compatible', async () => {
      vi.spyOn(window.api.os, 'platform').mockReturnValue('linux');

      const result = await WSLService.getSWLRoot(cwd, linuxPath);

      expect(result).toEqual('');
    });

    it('should call TerminalService.executeCommand only once to get a distro name because is cached', async () => {
      const path1 = '/Users/User/Documents/file_1.txt';
      const path2 = '/Users/User/Documents/file_2.txt';

      const result1 = await WSLService.getSWLRoot(cwd, path1);
      const result2 = await WSLService.getSWLRoot(cwd, path2);

      expect(result1).toEqual(
        '\\\\wsl$\\kali-linux\\Users\\User\\Documents\\file_1.txt'
      );
      expect(result2).toEqual(
        '\\\\wsl$\\kali-linux\\Users\\User\\Documents\\file_2.txt'
      );

      expect(window.api.os.platform).toHaveBeenCalledTimes(2);
      expect(window.api.os.platform).toHaveBeenCalledWith();

      expect(TerminalService.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalService.executeCommand).toHaveBeenCalledWith(
        getDistroNameWithExecuteCommandParams
      );
    });

    it('should call TerminalService.executeCommand with traceOnTime', async () => {
      const traceOnTime = true;
      await WSLService.getSWLRoot(cwd, linuxPath, traceOnTime);

      expect(TerminalService.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalService.executeCommand).toHaveBeenCalledWith({
        ...getDistroNameWithExecuteCommandParams,
        traceOnTime,
      });
    });
  });

  describe('getSWLHomePath', () => {
    beforeEach(() => {
      (TerminalService.executeCommand as Mock)
        .mockResolvedValueOnce({
          content: `${wslDistroName} (default)`,
        })
        .mockResolvedValue({
          content: `User`,
        });
    });

    it('should return the home path for WSL', async () => {
      const result = await WSLService.getSWLHomePath(cwd);

      expect(result).toEqual('\\\\wsl$\\kali-linux\\home\\User');

      expect(TerminalService.executeCommand).toHaveBeenCalledTimes(2);
      expect(TerminalService.executeCommand).toHaveBeenNthCalledWith(
        1,
        getDistroNameWithExecuteCommandParams
      );
      expect(TerminalService.executeCommand).toHaveBeenNthCalledWith(
        2,
        getHomePathWithExecuteCommandParams
      );
    });

    it('should return empty when executeCommand fails when getting distroName', async () => {
      (TerminalService.executeCommand as Mock)
        .mockReset()
        .mockRejectedValueOnce(new Error('error'))
        .mockResolvedValue({
          content: `User`,
        });

      const result = await WSLService.getSWLHomePath(cwd);

      expect(result).toEqual('');
    });

    it('should return empty when executeCommand fails when getting home path', async () => {
      (TerminalService.executeCommand as Mock)
        .mockReset()
        .mockResolvedValueOnce({
          content: `${wslDistroName} (default)`,
        })
        .mockRejectedValue(new Error('error'));

      const result = await WSLService.getSWLHomePath(cwd);

      expect(result).toEqual('');
    });

    it('should return empty when there is no WSL SO compatible', async () => {
      vi.spyOn(window.api.os, 'platform').mockReturnValue('linux');

      const result = await WSLService.getSWLHomePath(cwd);

      expect(result).toEqual('');
    });

    it('should empty when executeCommand returns content undefined when getting distroName', async () => {
      (TerminalService.executeCommand as Mock)
        .mockReset()
        .mockResolvedValueOnce({})
        .mockResolvedValue({
          content: `User`,
        });

      const result = await WSLService.getSWLHomePath(cwd);

      expect(result).toEqual('');
    });

    it('should empty when executeCommand returns content undefined when getting home path', async () => {
      (TerminalService.executeCommand as Mock)
        .mockReset()
        .mockResolvedValueOnce({
          content: `${wslDistroName} (default)`,
        })
        .mockResolvedValue({});

      const result = await WSLService.getSWLHomePath(cwd);

      expect(result).toEqual('');
    });

    it('should call TerminalService.executeCommand only once to get a distro name because is cached', async () => {
      await WSLService.getSWLHomePath(cwd);
      await WSLService.getSWLHomePath(cwd);

      expect(window.api.os.platform).toHaveBeenCalledTimes(4);
      expect(window.api.os.platform).toHaveBeenCalledWith();

      expect(TerminalService.executeCommand).toHaveBeenCalledTimes(3);
      expect(TerminalService.executeCommand).toHaveBeenNthCalledWith(
        1,
        getDistroNameWithExecuteCommandParams
      );
      expect(TerminalService.executeCommand).toHaveBeenNthCalledWith(
        2,
        getHomePathWithExecuteCommandParams
      );
      expect(TerminalService.executeCommand).toHaveBeenNthCalledWith(
        3,
        getHomePathWithExecuteCommandParams
      );
    });

    it('should call TerminalService.executeCommand with traceOnTime', async () => {
      const traceOnTime = true;
      await WSLService.getSWLHomePath(cwd, traceOnTime);

      expect(TerminalService.executeCommand).toHaveBeenCalledTimes(2);
      expect(TerminalService.executeCommand).toHaveBeenNthCalledWith(1, {
        ...getDistroNameWithExecuteCommandParams,
        traceOnTime,
      });
      expect(TerminalService.executeCommand).toHaveBeenNthCalledWith(2, {
        ...getHomePathWithExecuteCommandParams,
        traceOnTime,
      });
    });
  });

  describe('cleanSWLRoot', () => {
    const pathWithWSL = `\\\\wsl$\\${wslDistroName}\\Users\\User\\Documents\\file.txt`;

    it('should return the original path if WSL is not detected', async () => {
      const path = '/mnt/c/Users/User/Documents/file.txt';
      const result = await WSLService.cleanSWLRoot(cwd, path);
      expect(result).toEqual(path);
    });

    it('should remove the WSL root from the path if WSL is detected', async () => {
      const result = await WSLService.cleanSWLRoot(cwd, pathWithWSL);
      expect(result).toEqual('/Users/User/Documents/file.txt');
    });

    it('should return the original path when executeCommand fails', async () => {
      (TerminalService.executeCommand as Mock).mockRejectedValue(
        new Error('error')
      );
      const result = await WSLService.cleanSWLRoot(cwd, pathWithWSL);
      expect(result).toEqual(pathWithWSL);
    });

    it('should return the original path when there is no WSL SO compatible', async () => {
      vi.spyOn(window.api.os, 'platform').mockReturnValue('linux');
      const result = await WSLService.cleanSWLRoot(cwd, pathWithWSL);
      expect(result).toEqual(pathWithWSL);
    });

    it('should call TerminalService.executeCommand with traceOnTime', async () => {
      const traceOnTime = true;
      WSLService.cleanSWLRoot(cwd, pathWithWSL, traceOnTime);

      expect(TerminalService.executeCommand).toHaveBeenCalledTimes(1);
      expect(TerminalService.executeCommand).toHaveBeenCalledWith({
        ...getDistroNameWithExecuteCommandParams,
        traceOnTime,
      });
    });
  });
});

import { describe, expect, it, Mock, vi } from 'vitest';

import TerminalService, {
  type ExecuteCommandOptions,
  type TerminalResponse,
} from '../TerminalService';
import WSLService from '../WSLService';

vi.mock('../TerminalService');

const executeCommandMock = TerminalService.executeCommand as Mock<
  [ExecuteCommandOptions],
  Promise<TerminalResponse>
>;

describe('WSLService', () => {
  describe('cleanSWLRoot', () => {
    beforeEach(() => {
      executeCommandMock.mockResolvedValue({
        content: 'Ubuntu',
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it.only('should return the original path if WSL is not detected', async () => {
      const path = 'C:\\Users\\User\\Documents\\file.txt';
      const result = await WSLService.cleanSWLRoot('.', path);
      expect(result).toEqual(path);
    });

    it('should remove the WSL root from the path if WSL is detected', async () => {
      const path = '/mnt/c/Users/User/Documents/file.txt';
      const result = await WSLService.cleanSWLRoot('.', path);
      expect(result).toEqual('/Users/User/Documents/file.txt');
    });
  });
});

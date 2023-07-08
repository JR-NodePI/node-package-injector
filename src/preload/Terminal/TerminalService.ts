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
export default class TerminalService {
  static async executeCommand({ command, args = [], cwd }: ExecuteCommandOptions): Promise<string> {
    let outputs: ExecuteCommandOutput[] = [];

    try {
      outputs = await TerminalRepository.executeCommand({ command, args, cwd });
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
}

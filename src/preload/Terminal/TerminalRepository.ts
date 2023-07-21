import { spawn } from 'child_process';
import os from 'os';

import {
  ExecuteCommandOutputType,
  type ExecuteCommandOptions,
  type ExecuteCommandOutput,
} from './TerminalTypes';

const cleanOutput = (output: string): string =>
  output.replace(/[^a-z0-9-\n\s\r\t{}()"',:_\\/\\*+.@]/gi, '').trim();

const getConsoleInitColorizedFlag = (
  type: ExecuteCommandOutput['type']
): string[] => {
  const typeColor =
    type === ExecuteCommandOutputType.INIT
      ? '#3ba93b'
      : type === ExecuteCommandOutputType.ERROR ||
        type === ExecuteCommandOutputType.STDERR
      ? '#d70065'
      : type === ExecuteCommandOutputType.CLOSE ||
        type === ExecuteCommandOutputType.EXIT
      ? '#ffa600'
      : '#007390';
  return [`%c> terminal %c${type}`, `color:#5858f0`, `color:${typeColor}`];
};

const consoleLog = (type: ExecuteCommandOutput['type'], ...params): void =>
  // eslint-disable-next-line no-console
  console.log(...getConsoleInitColorizedFlag(type), ...params);
const consoleError = (type: ExecuteCommandOutput['type'], ...params): void =>
  // eslint-disable-next-line no-console
  console.error(...getConsoleInitColorizedFlag(type), ...params);

const TimeoutToExit = 500;
let exitTimeoutId: NodeJS.Timeout;
export default class TerminalRepository {
  static executeCommand({
    command,
    args = [],
    cwd,
  }: ExecuteCommandOptions): Promise<ExecuteCommandOutput[]> {
    return new Promise((resolve, reject) => {
      if (!cwd) {
        reject(new Error('cwd is required'));
      }

      const commandID = `${cwd} ${command} ${args.join(' ')}`;
      consoleLog(ExecuteCommandOutputType.INIT, commandID);

      const soShell = ['win32', 'cygwin'].includes(os.platform())
        ? 'powershell'
        : 'bash';

      const cmd = spawn(command, args, {
        cwd,
        env: process.env,
        shell: soShell,
      });

      const outputs: ExecuteCommandOutput[] = [];

      cmd.stdout.on('data', data => {
        const message = data instanceof Buffer ? data.toString() : data;
        const cleanMessage = cleanOutput(message);
        consoleLog(ExecuteCommandOutputType.STDOUT, '\n', cleanMessage);
        outputs.push({
          type: ExecuteCommandOutputType.STDOUT,
          data: cleanMessage,
        });
      });

      cmd.stderr.on('data', data => {
        const message = data instanceof Buffer ? data.toString() : data;
        const cleanMessage = cleanOutput(message);
        const isError = [
          new RegExp('error', 'gi'),
          new RegExp('command not found', 'gi'),
        ].some(regExp => regExp.test(cleanMessage));

        if (isError) {
          const error = new Error(cleanMessage);
          consoleError(
            ExecuteCommandOutputType.STDERR,
            ': ',
            commandID,
            ': ',
            error
          );
          reject(error);
        } else {
          consoleLog(ExecuteCommandOutputType.STDERR, '\n', cleanMessage);
          outputs.push({
            type: ExecuteCommandOutputType.STDERR,
            data: cleanMessage,
          });
        }
      });

      cmd.on('error', error => {
        consoleError(
          ExecuteCommandOutputType.ERROR,
          ': ',
          commandID,
          ': \n',
          error
        );
        reject(error);
      });

      cmd.on('close', code => {
        if (exitTimeoutId) {
          clearTimeout(exitTimeoutId);
        }
        consoleLog(ExecuteCommandOutputType.CLOSE, ': ', commandID, ': ', code);
        resolve(outputs);
      });

      cmd.on('exit', code => {
        if (exitTimeoutId) {
          clearTimeout(exitTimeoutId);
        }
        exitTimeoutId = setTimeout(() => {
          consoleLog(
            ExecuteCommandOutputType.EXIT,
            ': ',
            commandID,
            ': ',
            code
          );
          resolve(outputs);
        }, TimeoutToExit);
      });
    });
  }
}

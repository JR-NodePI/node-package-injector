import { spawn } from 'child_process';

import {
  ExecuteCommandOutputType,
  type ExecuteCommandOptions,
  type ExecuteCommandOutput,
} from './TerminalTypes';

const cleanOutput = (output: string): string =>
  output.replace(/[^a-z0-9-\n\s\r\t{}()"',:_\\/\\*+.@]/gi, '').trim();

const getConsoleInitColorizedFlag = (): string[] => [
  '%c> terminal ',
  'color:#5858f0',
];
const getConsoleColorizedOutputType = (
  type: ExecuteCommandOutput['type']
): string[] => [`%c${type}`, 'color:#d70065'];

const consoleLog = (type: ExecuteCommandOutput['type'], ...params): void =>
  console.log(
    ...getConsoleInitColorizedFlag(),
    ...getConsoleColorizedOutputType(type),
    ...params
  );
const consoleError = (type: ExecuteCommandOutput['type'], ...params): void =>
  console.error(
    ...getConsoleInitColorizedFlag(),
    ...getConsoleColorizedOutputType(type),
    ...params
  );

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
      consoleLog('- command: ', commandID);

      const cmd = spawn(command, args, {
        cwd,
        env: process.env,
        shell: true,
      });

      const outputs: ExecuteCommandOutput[] = [];

      cmd.stdout.on('data', data => {
        const message = data instanceof Buffer ? data.toString() : data;
        const cleanMessage = cleanOutput(message);
        consoleLog(ExecuteCommandOutputType.STDOUT, cleanMessage);
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
          consoleLog(ExecuteCommandOutputType.STDERR, cleanMessage);
          outputs.push({
            type: ExecuteCommandOutputType.STDERR,
            data: cleanMessage,
          });
        }
      });

      cmd.on('error', error => {
        consoleError(
          ExecuteCommandOutputType.CLOSE,
          ': ',
          commandID,
          ': ',
          error
        );
        reject(error);
      });

      cmd.on('close', code => {
        consoleLog(ExecuteCommandOutputType.CLOSE, ': ', commandID, ': ', code);
        resolve(outputs);
      });

      cmd.on('exit', code => {
        consoleLog(ExecuteCommandOutputType.CLOSE, ': ', commandID, ': ', code);
        setTimeout(() => {
          resolve(outputs);
        }, 3000);
      });
    });
  }
}

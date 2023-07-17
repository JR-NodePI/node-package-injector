import { spawn } from 'child_process';

import {
  ExecuteCommandOutputType,
  type ExecuteCommandOptions,
  type ExecuteCommandOutput,
} from './TerminalTypes';

export default class TerminalRepository {
  static executeCommand({
    command,
    args = [],
    cwd,
  }: ExecuteCommandOptions): Promise<ExecuteCommandOutput[]> {
    return new Promise((resolve, reject) => {
      console.log('> terminal - command: ', cwd, ': ', command, args.join(' '));

      const cmd = spawn(command, args, {
        cwd,
        env: process.env,
        shell: true,
      });

      const output: ExecuteCommandOutput[] = [];

      cmd.stdout.on('data', data => {
        const message = data instanceof Buffer ? data.toString() : data;
        console.log(message);
        output.push({ type: ExecuteCommandOutputType.STDOUT, data: message });
      });

      cmd.stderr.on('data', data => {
        const message = data instanceof Buffer ? data.toString() : data;
        const isError = [new RegExp('error', 'gi'), new RegExp('command not found', 'gi')].some(
          regExp => regExp.test(message)
        );

        if (isError) {
          const error = new Error(message);
          console.error(error);
          reject(error);
        } else {
          console.log(message);
          output.push({ type: ExecuteCommandOutputType.STDERR, data: message });
        }
      });

      cmd.on('error', error => {
        console.error(error);
        reject(error);
      });

      cmd.on('close', code => {
        console.log('> terminal ', ExecuteCommandOutputType.CLOSE, ': ', code);
        resolve(output);
      });

      cmd.on('exit', code => {
        console.log('> terminal ', ExecuteCommandOutputType.EXIT, ': ', code);
        resolve(output);
      });
    });
  }
}

import { spawn } from 'child_process';

import {
  ExecuteCommandOutputType,
  type ExecuteCommandOptions,
  type ExecuteCommandOutput,
} from './TerminalTypes';

let isWSL;

export default class TerminalRepository {
  static executeCommand({
    command,
    args = [],
    cwd,
  }: ExecuteCommandOptions): Promise<ExecuteCommandOutput[]> {
    return new Promise((resolve, reject) => {
      if (isWSL == null) {
        isWSL = false;
        TerminalRepository.checkWSL(cwd ?? '').then(is => {
          isWSL = is;
          TerminalRepository.executeCommand({ command, args, cwd });
        });
        return;
      }

      const finalCommand = isWSL ? 'wsl' : command;
      const finalArgs = isWSL ? ['-e', command, ...args] : args;

      console.log('> terminal - command: ', cwd, ': ', finalCommand, finalArgs.join(' '));

      const cmd = spawn(finalCommand, finalArgs, {
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

  private static async checkWSL(cwd: string): Promise<boolean> {
    let isWSL = false;
    if (process.platform === 'win32') {
      try {
        const wslOutput = await TerminalRepository.executeCommand({
          command: 'wsl',
          args: ['--version'],
          cwd,
        });
        isWSL = wslOutput != null && wslOutput.length > 0;
      } catch (error) {
        isWSL = false;
      }
    }

    return isWSL;
  }
}

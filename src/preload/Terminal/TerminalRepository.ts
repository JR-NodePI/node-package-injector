import { spawn } from 'child_process';

import {
  ExecuteCommandOutputType,
  OutputColor,
  OutputIcons,
  OutputTypeToColor,
} from './TerminalConstants';
import {
  type ExecuteCommandOptions,
  type ExecuteCommandOutput,
} from './TerminalTypes';

const cleanOutput = (output: string): string =>
  output
    .replace(/[^a-z0-9-\n\s\r\t{}()"',:_\\/\\*+.|><=@áéíóúÁÉÍÓÚñçü]/gi, '')
    .trim();

const getConsoleInitColorizedFlag = (
  type: ExecuteCommandOutput['type'],
  pid?: number,
  icon?: string
): string[] => {
  const typeColor = OutputTypeToColor[type];
  return [
    `%c>${icon ? ` ${icon}` : ''} %c${type.padEnd(5, ' ')}`,
    `color:${OutputColor}`,
    `color:${typeColor}`,
    `PID: ${pid}`,
  ];
};

const consoleLog = ({
  type,
  pid,
  icon,
  data,
}: ExecuteCommandOutput & { icon?: string }): void => {
  // eslint-disable-next-line no-console
  console.log(...getConsoleInitColorizedFlag(type, pid, icon), `\n${data}`);
};

const consoleWarn = ({
  type,
  pid,
  icon,
  data,
}: ExecuteCommandOutput & { icon?: string }): void => {
  // eslint-disable-next-line no-console
  console.warn(...getConsoleInitColorizedFlag(type, pid, icon), `\n${data}`);
};

const consoleError = ({
  type,
  pid,
  icon,
  data,
}: ExecuteCommandOutput & { icon?: string }): void => {
  // eslint-disable-next-line no-console
  console.error(...getConsoleInitColorizedFlag(type, pid, icon), '\n', data);
};

const displayLogs = (
  outputStack: ExecuteCommandOutput[],
  icon?: string
): void => {
  outputStack.forEach(({ type, pid, data }) => {
    switch (type) {
      case ExecuteCommandOutputType.CLOSE:
      case ExecuteCommandOutputType.EXIT:
      case ExecuteCommandOutputType.INIT:
      case ExecuteCommandOutputType.STDOUT:
        consoleLog({ type, pid, icon, data });
        break;
      case ExecuteCommandOutputType.STDERR_WARN:
        consoleWarn({ type, pid, icon, data });
        break;
      case ExecuteCommandOutputType.ERROR:
      case ExecuteCommandOutputType.STDERR_ERROR:
        consoleError({ type, pid, icon, data });
        break;
      default:
        break;
    }
  });
};

const exitDelay = 500;
let exitTimeoutId: NodeJS.Timeout;
export default class TerminalRepository {
  static executeCommand({
    command,
    args = [],
    cwd,
    traceOnTime,
    abortController,
    ignoreStderrErrors,
  }: ExecuteCommandOptions): Promise<ExecuteCommandOutput[]> {
    return new Promise((resolve, reject) => {
      if (!cwd) {
        reject(new Error('cwd is required'));
      }

      if (abortController?.signal?.aborted) {
        reject(new Error('Process was aborted'));
      }

      const soShell = ['win32'].includes(process.platform)
        ? 'powershell'
        : 'bash';

      const cmd = spawn(command, args, {
        cwd,
        env: process.env,
        shell: soShell,
        signal: abortController?.signal,
      });

      const icon = OutputIcons[Math.floor(Math.random() * OutputIcons.length)];

      const argsAsString = args.join(' ');
      const commandTrace = `CWD: ${cwd}\nCMD: ${command} ${argsAsString}`;
      const outputs: ExecuteCommandOutput[] = [];
      let outputStack: ExecuteCommandOutput[] = [];
      let aborted = false;

      abortController?.signal.addEventListener('abort', () => {
        cmd.kill();
        aborted = true;
      });

      const enqueueConsoleOutput = (output: ExecuteCommandOutput): void => {
        if (aborted) {
          return;
        }

        outputStack.push(output);

        const mustDisplay =
          traceOnTime ||
          output.type === ExecuteCommandOutputType.STDERR_ERROR ||
          output.type === ExecuteCommandOutputType.ERROR ||
          output.type === ExecuteCommandOutputType.CLOSE ||
          output.type === ExecuteCommandOutputType.EXIT;

        if (mustDisplay) {
          displayLogs(outputStack, icon);
          outputStack = [];
        }
      };

      enqueueConsoleOutput({
        type: ExecuteCommandOutputType.INIT,
        pid: cmd.pid,
        data: commandTrace,
      });

      cmd.stdout.on('data', data => {
        const message = data instanceof Buffer ? data.toString() : data;
        const cleanMessage = cleanOutput(message);
        const output = {
          type: ExecuteCommandOutputType.STDOUT,
          pid: cmd.pid,
          data: cleanMessage,
        };
        outputs.push(output);
        enqueueConsoleOutput(output);
      });

      cmd.stderr.on('data', data => {
        const message = data instanceof Buffer ? data.toString() : data;
        const cleanMessage = cleanOutput(message);
        const isError = [
          new RegExp('fatal: ', 'gi'),
          new RegExp('error ', 'gi'),
          new RegExp('error: ', 'gi'),
          new RegExp('command not found', 'gi'),
        ].some(regExp => regExp.test(cleanMessage));

        if (isError && !ignoreStderrErrors) {
          const error = new Error(cleanMessage);
          reject(error);
          enqueueConsoleOutput({
            type: ExecuteCommandOutputType.STDERR_ERROR,
            pid: cmd.pid,
            data: error,
          });
        } else {
          const isIgnoredError = isError && ignoreStderrErrors;
          const output = {
            type: ExecuteCommandOutputType.STDERR_WARN,
            pid: cmd.pid,
            data: cleanMessage,
          };

          if (!isIgnoredError) {
            outputs.push(output);
          }

          enqueueConsoleOutput(output);
        }
      });

      cmd.on('error', error => {
        reject(error);
        enqueueConsoleOutput({
          type: ExecuteCommandOutputType.ERROR,
          pid: cmd.pid,
          data: error,
        });
      });

      cmd.on('close', code => {
        if (exitTimeoutId) {
          clearTimeout(exitTimeoutId);
        }
        resolve(outputs);
        enqueueConsoleOutput({
          type: ExecuteCommandOutputType.CLOSE,
          pid: cmd.pid,
          data: code,
        });
      });

      cmd.on('exit', code => {
        if (exitTimeoutId) {
          clearTimeout(exitTimeoutId);
        }
        exitTimeoutId = setTimeout(() => {
          resolve(outputs);
          enqueueConsoleOutput({
            type: ExecuteCommandOutputType.EXIT,
            pid: cmd.pid,
            data: code,
          });
        }, exitDelay);
      });
    });
  }
}

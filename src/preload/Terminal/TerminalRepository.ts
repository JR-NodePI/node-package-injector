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
  icon?: string
): string[] => {
  const typeColor = OutputTypeToColor[type];
  return [
    `%c>${icon ? ` ${icon}` : ''} %c${type}`,
    `color:${OutputColor}`,
    `color:${typeColor}`,
  ];
};

const consoleLog = (
  type: ExecuteCommandOutput['type'],
  icon?: string,
  ...params
): void =>
  // eslint-disable-next-line no-console
  console.log(...getConsoleInitColorizedFlag(type, icon), ...params);

const consoleWarn = (
  type: ExecuteCommandOutput['type'],
  icon?: string,
  ...params
): void =>
  // eslint-disable-next-line no-console
  console.warn(...getConsoleInitColorizedFlag(type, icon), ...params);

const consoleError = (
  type: ExecuteCommandOutput['type'],
  icon?: string,
  ...params
): void =>
  // eslint-disable-next-line no-console
  console.error(...getConsoleInitColorizedFlag(type, icon), ...params);

const displayLogs = (
  outputStack: ExecuteCommandOutput[],
  icon?: string
): void => {
  outputStack.forEach(({ type, data }) => {
    switch (type) {
      case ExecuteCommandOutputType.CLOSE:
      case ExecuteCommandOutputType.EXIT:
      case ExecuteCommandOutputType.INIT:
      case ExecuteCommandOutputType.STDOUT:
        consoleLog(type, icon, data);
        break;
      case ExecuteCommandOutputType.STDERR_WARN:
        consoleWarn(type, icon, data);
        break;
      case ExecuteCommandOutputType.ERROR:
      case ExecuteCommandOutputType.STDERR_ERROR:
        consoleError(type, icon, data);
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

      const soShell = ['win32'].includes(process.platform)
        ? 'powershell'
        : 'bash';

      const cmd = spawn(command, args, {
        cwd,
        env: process.env,
        shell: soShell,
        signal: abortController?.signal,
      });

      abortController?.signal.addEventListener('abort', () => {
        cmd.kill();
        cmd.emit('close', 0);
      });

      const icon = OutputIcons[Math.floor(Math.random() * OutputIcons.length)];

      const commandTrace = `${cwd} ${command} ${args.join(' ')}`;
      const outputs: ExecuteCommandOutput[] = [];
      let outputStack: ExecuteCommandOutput[] = [];

      const enqueueOutput = (output: ExecuteCommandOutput): void => {
        outputStack.push(output);

        const mustDisplay =
          traceOnTime ||
          output.type === ExecuteCommandOutputType.STDERR_ERROR ||
          output.type === ExecuteCommandOutputType.ERROR ||
          output.type === ExecuteCommandOutputType.CLOSE ||
          output.type === ExecuteCommandOutputType.EXIT;

        if (mustDisplay) {
          displayLogs(outputStack, icon);
        }

        if (mustDisplay) {
          outputStack = [];
        }
      };

      enqueueOutput({
        type: ExecuteCommandOutputType.INIT,
        data: commandTrace,
      });

      cmd.stdout.on('data', data => {
        const message = data instanceof Buffer ? data.toString() : data;
        const cleanMessage = cleanOutput(message);
        const output = {
          type: ExecuteCommandOutputType.STDOUT,
          data: cleanMessage,
        };
        outputs.push(output);
        enqueueOutput(output);
      });

      cmd.stderr.on('data', data => {
        const message = data instanceof Buffer ? data.toString() : data;
        const cleanMessage = cleanOutput(message);
        const isError = [
          new RegExp('fatal: ', 'gi'),
          new RegExp('error ', 'gi'),
          new RegExp('command not found', 'gi'),
        ].some(regExp => regExp.test(cleanMessage));

        if (isError && !ignoreStderrErrors) {
          const error = new Error(cleanMessage);
          const output = {
            type: ExecuteCommandOutputType.STDERR_ERROR,
            data: error,
          };
          enqueueOutput(output);
          reject(error);
        } else {
          const isIgnoredError = isError && ignoreStderrErrors;
          const output = {
            type: ExecuteCommandOutputType.STDERR_WARN,
            data: cleanMessage,
          };

          if (!isIgnoredError) {
            outputs.push(output);
          }

          enqueueOutput(output);
        }
      });

      cmd.on('error', error => {
        const output = {
          type: ExecuteCommandOutputType.ERROR,
          data: error,
        };
        enqueueOutput(output);
        reject(error);
      });

      cmd.on('close', code => {
        if (exitTimeoutId) {
          clearTimeout(exitTimeoutId);
        }
        const output = {
          type: ExecuteCommandOutputType.CLOSE,
          data: code,
        };
        enqueueOutput(output);
        resolve(outputs);
      });

      cmd.on('exit', code => {
        if (exitTimeoutId) {
          clearTimeout(exitTimeoutId);
        }
        exitTimeoutId = setTimeout(() => {
          const output = {
            type: ExecuteCommandOutputType.EXIT,
            data: code,
          };
          enqueueOutput(output);
          resolve(outputs);
        }, exitDelay);
      });
    });
  }
}

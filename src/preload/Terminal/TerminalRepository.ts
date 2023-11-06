import { spawn, spawnSync } from 'node:child_process';

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

type TraceConfig = ExecuteCommandOutput & {
  icon?: string;
  logFn?: typeof console.log | typeof console.warn;
};

const cleanOutput = (
  output: string
): { cleanMessage: string; outputPid: string } => {
  let outputPid;
  let cleanMessage = output
    .replace(/[^a-z0-9-\n\s\r\t{}()"',:_\\/\\*+.|><=@áéíóúÁÉÍÓÚñçü]/gi, '')
    .trim();

  const patternPid = new RegExp('<<PID:([^>]+)>>', 'g');
  if (patternPid.test(cleanMessage)) {
    outputPid = cleanMessage.replace(patternPid, '$1');
    cleanMessage = cleanMessage.replace(patternPid, '');
  }

  return { cleanMessage, outputPid };
};

const getConsoleInitColorizedFlag = (
  type: ExecuteCommandOutput['type'],
  pid?: number,
  icon?: string
): string[] => {
  const typeColor = OutputTypeToColor[type];
  return [
    `%c${icon} %c${type.padEnd(5, ' ')}`,
    `color:${OutputColor}`,
    `color:${typeColor}`,
    `PID: ${pid}`,
  ];
};

const printMiddleTraceWithIconByLine = ({
  logFn,
  type,
  icon,
  data,
}: TraceConfig): void => {
  const color =
    type === ExecuteCommandOutputType.STDOUT ? '' : OutputTypeToColor[type];

  logFn?.(
    `%c${data}`.replace(/^(.*)/gi, `${icon} $1`).replace(/\n/gi, `\n${icon} `),
    `color:${color}`
  );
};

const printMiddleTrace = ({ logFn, type, icon, data }: TraceConfig): void => {
  typeof data !== 'object'
    ? printMiddleTraceWithIconByLine({ logFn, type, icon, data })
    : logFn?.(icon, data);
};

const consolePrint = ({ logFn, type, pid, icon, data }: TraceConfig): void => {
  const isMiddleTrace =
    type === ExecuteCommandOutputType.STDOUT ||
    type === ExecuteCommandOutputType.STDERR_WARN;

  if (isMiddleTrace) {
    printMiddleTrace({ logFn, type, icon, data });
    return;
  }

  logFn?.(...getConsoleInitColorizedFlag(type, pid, icon), `${data}`);
};

const consoleLog = (config: TraceConfig): void => {
  // eslint-disable-next-line no-console
  consolePrint({ ...config, logFn: console.log });
};

const consoleWarn = (config: TraceConfig): void => {
  // eslint-disable-next-line no-console
  consolePrint({ ...config, logFn: console.log });
};

const consoleError = (config: TraceConfig): void => {
  // eslint-disable-next-line no-console
  consolePrint({ ...config, logFn: console.error });
};

const displayLogs = ({
  outputStack,
  icon,
}: {
  outputStack: ExecuteCommandOutput[];
  icon?: string;
}): void => {
  outputStack.forEach(({ type, pid, data }) => {
    switch (type) {
      case ExecuteCommandOutputType.STDERR_WARN:
        consoleWarn({ type, pid, icon, data });
        break;
      case ExecuteCommandOutputType.ERROR:
      case ExecuteCommandOutputType.STDERR_ERROR:
        consoleError({ type, pid, icon, data });
        break;
      case ExecuteCommandOutputType.CLOSE:
      case ExecuteCommandOutputType.EXIT:
      case ExecuteCommandOutputType.INIT:
      case ExecuteCommandOutputType.STDOUT:
      default:
        consoleLog({ type, pid, icon, data });
        break;
    }
  });
};

const exitDelay = 1000;
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
      const commandTrace = `\n   CWD: ${cwd}\n   CMD: ${command} ${argsAsString}`;
      const outputs: ExecuteCommandOutput[] = [];

      let outputTermPid: string;
      let outputStack: ExecuteCommandOutput[] = [];

      abortController?.signal.addEventListener('abort', () => {
        if (outputTermPid) {
          spawnSync('kill', ['-SIGKILL', outputTermPid], { shell: 'bash' });
        }
        cmd.kill('SIGKILL');
      });

      const enqueueConsoleOutput = (output: ExecuteCommandOutput): void => {
        outputStack.push(output);

        const mustDisplay =
          traceOnTime ||
          output.type === ExecuteCommandOutputType.STDERR_ERROR ||
          output.type === ExecuteCommandOutputType.ERROR ||
          output.type === ExecuteCommandOutputType.CLOSE ||
          output.type === ExecuteCommandOutputType.EXIT;

        if (mustDisplay) {
          displayLogs({ outputStack, icon });
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
        const { cleanMessage, outputPid } = cleanOutput(message);
        const output = {
          type: ExecuteCommandOutputType.STDOUT,
          pid: cmd.pid,
          data: cleanMessage,
        };
        if (outputPid) {
          outputTermPid = outputPid;
        }
        outputs.push(output);
        enqueueConsoleOutput(output);
      });

      cmd.stderr.on('data', data => {
        const message = data instanceof Buffer ? data.toString() : data;
        const { cleanMessage, outputPid } = cleanOutput(message);
        const isError = [
          new RegExp('fatal: ', 'gi'),
          new RegExp('error ', 'gi'),
          new RegExp('error: ', 'gi'),
          new RegExp('command not found', 'gi'),
          new RegExp('no such file or directory', 'gi'),
          new RegExp('is not a directory', 'gi'),
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
            if (outputPid) {
              outputTermPid = outputPid;
            }
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

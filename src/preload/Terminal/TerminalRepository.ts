import { spawn, spawnSync } from 'node:child_process';

import {
  ExecuteCommandOutputType,
  OutputColor,
  OutputIcons,
  OutputTypeToColor,
  STDERR_OUTPUT_DETECT_ERROR_PATTERNS,
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
    resolveTimeoutAfterFirstOutput,
  }: ExecuteCommandOptions): Promise<ExecuteCommandOutput[]> {
    if (!cwd) {
      throw new Error('cwd is required');
    }

    if (abortController?.signal?.aborted) {
      throw new Error('Process was aborted');
    }

    const cmd = spawn(command, args, {
      cwd,
      env: process.env,
      shell: ['win32'].includes(process.platform) ? 'powershell' : true,
      signal: abortController?.signal,
    });

    const icon = OutputIcons[Math.floor(Math.random() * OutputIcons.length)];

    const argsAsString = args.join(' ');
    const commandTrace = `\n   CWD: ${cwd}\n   CMD: ${command} ${argsAsString}`;
    const outputs: ExecuteCommandOutput[] = [];

    let isAborted = false;
    let outputTermPid: string;
    let outputStack: ExecuteCommandOutput[] = [];
    let resolveAfterFirstOutputId;

    const enqueueConsoleOutput = (output: ExecuteCommandOutput): void => {
      if (isAborted) {
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
        displayLogs({ outputStack, icon });
        outputStack = [];
      }
    };

    enqueueConsoleOutput({
      type: ExecuteCommandOutputType.INIT,
      pid: cmd.pid,
      data: commandTrace,
    });

    abortController?.signal.addEventListener('abort', () => {
      if (resolveAfterFirstOutputId) {
        clearTimeout(resolveAfterFirstOutputId);
      }

      if (outputTermPid) {
        enqueueConsoleOutput({
          type: ExecuteCommandOutputType.CLOSE,
          pid: cmd.pid,
          data: `kill ${outputTermPid}`,
        });
        enqueueConsoleOutput({
          type: ExecuteCommandOutputType.CLOSE,
          pid: cmd.pid,
          data: `kill -SIGKILL ${outputTermPid}`,
        });
        spawnSync('kill', [outputTermPid], { shell: 'bash' });
        spawnSync('kill', ['-SIGKILL', outputTermPid], { shell: 'bash' });
      }

      cmd.kill();
      cmd.kill('SIGKILL');
      isAborted = true;
    });

    return new Promise((resolve, reject) => {
      const resolveAfterFirstOutput = (): void => {
        if (!resolveTimeoutAfterFirstOutput) {
          return;
        }

        if (resolveAfterFirstOutputId) {
          return;
        }

        resolveAfterFirstOutputId = setTimeout(() => {
          resolve(outputs);
          enqueueConsoleOutput({
            type: ExecuteCommandOutputType.STDOUT,
            pid: cmd.pid,
            data: 'Resolve on timeout, still running in background',
          });
        }, resolveTimeoutAfterFirstOutput);
      };

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
        resolveAfterFirstOutput();
      });

      cmd.stderr.on('data', data => {
        const message = data instanceof Buffer ? data.toString() : data;
        const { cleanMessage, outputPid } = cleanOutput(message);
        const isError =
          !ignoreStderrErrors &&
          STDERR_OUTPUT_DETECT_ERROR_PATTERNS.some(regExp =>
            regExp.test(cleanMessage)
          );

        if (isError) {
          const error = new Error(cleanMessage);
          reject(error);
          clearTimeout(resolveAfterFirstOutputId);
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

            if (outputPid) {
              outputTermPid = outputPid;
            }
          }

          enqueueConsoleOutput(output);
          resolveAfterFirstOutput();
        }
      });

      cmd.on('error', error => {
        reject(error);
        clearTimeout(resolveAfterFirstOutputId);
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
        clearTimeout(resolveAfterFirstOutputId);
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
          clearTimeout(resolveAfterFirstOutputId);
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

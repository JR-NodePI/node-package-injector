import { SpawnOptionsWithoutStdio } from 'child_process';

import { ExecuteCommandOutputType } from './TerminalConstants';

export type ExecuteCommandOutput = {
  type: (typeof ExecuteCommandOutputType)[keyof typeof ExecuteCommandOutputType];
  pid?: number;
  data: null | string | number | Error;
};

export type ExecuteCommandOptions = {
  abortController?: AbortController;
  addIcons?: boolean;
  args?: string[];
  command: string;
  cwd?: string;
  groupLogsLabel?: string;
  ignoreStderrErrors?: boolean;
  resolveTimeout?: number;
  resolveTimeoutAfterFirstOutput?: number;
  syncMode?: boolean;
  traceOnTime?: boolean;
};

export type executeCommandAsyncModeOptions = {
  childProcessParams: SpawnOptionsWithoutStdio;
  enqueueConsoleOutput: (
    output: ExecuteCommandOutput,
    isAborted?: boolean
  ) => void;
  initCommandOutput: string;
  outputs: ExecuteCommandOutput[];
} & Pick<
  ExecuteCommandOptions,
  | 'abortController'
  | 'args'
  | 'command'
  | 'ignoreStderrErrors'
  | 'resolveTimeout'
  | 'resolveTimeoutAfterFirstOutput'
>;

export type executeCommandSyncModeOptions = Omit<
  executeCommandAsyncModeOptions,
  'abortController' | 'resolveTimeoutAfterFirstOutput'
>;

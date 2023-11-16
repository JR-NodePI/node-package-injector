import { SpawnOptionsWithoutStdio } from 'child_process';

import { ExecuteCommandOutputType } from './TerminalConstants';

export type ExecuteCommandOutput = {
  type: (typeof ExecuteCommandOutputType)[keyof typeof ExecuteCommandOutputType];
  pid?: number;
  data: null | string | number | Error;
};

export type ExecuteCommandOptions = {
  command: string;
  cwd?: string;
  args?: string[];
  traceOnTime?: boolean;
  abortController?: AbortController;
  ignoreStderrErrors?: boolean;
  resolveTimeoutAfterFirstOutput?: number;
  syncMode?: boolean;
  addIcons?: boolean;
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
  | 'resolveTimeoutAfterFirstOutput'
>;

export type executeCommandSyncModeOptions = Omit<
  executeCommandAsyncModeOptions,
  'abortController' | 'resolveTimeoutAfterFirstOutput'
>;

import { ExecuteCommandOutputType } from './TerminalConstants';

export type ExecuteCommandOutput = {
  type: (typeof ExecuteCommandOutputType)[keyof typeof ExecuteCommandOutputType];
  pid?: number;
  data: null | string | number | Error;
  hidePID?: boolean;
};

export type ExecuteCommandOptions = {
  command: string;
  cwd?: string;
  args?: string[];
  skipWSL?: boolean;
  traceOnTime?: boolean;
  abortController?: AbortController;
  ignoreStderrErrors?: boolean;
  hidePID?: boolean;
};

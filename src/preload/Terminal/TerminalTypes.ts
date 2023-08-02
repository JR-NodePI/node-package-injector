import { ExecuteCommandOutputType } from './TerminalConstants';

export type ExecuteCommandOutput = {
  type: (typeof ExecuteCommandOutputType)[keyof typeof ExecuteCommandOutputType];
  data: null | string | number | Error;
};

export type ExecuteCommandOptions = {
  command: string;
  cwd?: string;
  args?: string[];
  skipWSL?: boolean;
  traceOnTime?: boolean;
};

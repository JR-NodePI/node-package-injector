export const ExecuteCommandOutputType = {
  STDOUT: 'stdout',
  STDERR: 'stderr',
  CLOSE: 'close',
  EXIT: 'exit',
  ERROR: 'error',
  INIT: 'init',
} as const;

export type ExecuteCommandOutput = {
  type: (typeof ExecuteCommandOutputType)[keyof typeof ExecuteCommandOutputType];
  data: null | string | number;
};

export type ExecuteCommandOptions = {
  command: string;
  cwd?: string;
  args?: string[];
  skipWSL?: boolean;
};

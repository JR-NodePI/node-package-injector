export const ExecuteCommandOutputType = {
  STDOUT: 'stdout' as const,
  STDERR: 'stderr' as const,
  CLOSE: 'close' as const,
  EXIT: 'exit' as const,
  ERROR: 'error' as const,
};

export type ExecuteCommandOutput = {
  type: (typeof ExecuteCommandOutputType)[keyof typeof ExecuteCommandOutputType];
  data: null | string | number;
};

export type ExecuteCommandOptions = {
  command: string;
  cwd?: string;
  args?: string[];
};

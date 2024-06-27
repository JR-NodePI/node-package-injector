import type { GIT_COMMANDS } from './PackageGitConstants';

export type PackageGitCommandsProps = {
  disabled?: boolean;
  cwd: string;
  loadBranches: () => Promise<void>;
};

export type GitCommandName = keyof typeof GIT_COMMANDS;

export type GitCommands = (typeof GIT_COMMANDS)[GitCommandName]['commands'];

export type GitCommand = string | string[];

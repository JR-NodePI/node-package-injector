import type { GIT_COMMANDS } from './PackageGitConstants';

export type PackageGitCommandsProps = {
  disabled?: boolean;
  cwd: string;
  loadBranches: () => Promise<void>;
};

export type GitCommandName = keyof typeof GIT_COMMANDS;

export type GitCommandValue = (typeof GIT_COMMANDS)[GitCommandName]['value'];

export type GitCommand = string | string[];

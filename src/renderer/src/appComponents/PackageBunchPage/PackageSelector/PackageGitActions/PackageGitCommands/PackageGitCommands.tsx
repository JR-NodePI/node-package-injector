import { useState } from 'react';

import GitService from '@renderer/services/GitService';
import { Button, SettingsModal, Spinner, useModal } from 'fratch-ui';
import { IconGit } from 'fratch-ui/components/Icons/Icons';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import styles from './PackageGitCommands.module.css';

type PackageGitCommandsProps = {
  disabled?: boolean;
  cwd: string;
  loadBranches: () => Promise<void>;
};

const GIT_COMMANDS = {
  pull: { label: 'git pull', value: 'pull', needsConfirmation: false } as const,
  fetch: {
    label: 'git fetch',
    value: 'fetch',
    needsConfirmation: false,
  } as const,
  clean: {
    label: 'git checkout .',
    value: ['checkout', '.'],
    needsConfirmation: true,
  } as const,
  reset: {
    label: 'git reset --hard HEAD~1',
    value: ['reset', '--hard', 'HEAD~1'],
    needsConfirmation: true,
  } as const,
} as const;

type GitCommandName = keyof typeof GIT_COMMANDS;
type GitCommandValue = (typeof GIT_COMMANDS)[GitCommandName]['value'];
type GitCommand = string | string[];

export default function PackageGitCommands({
  cwd,
  disabled,
  loadBranches,
}: PackageGitCommandsProps): JSX.Element {
  const { showModalConfirm } = useModal();
  const [isLoading, setIsLoading] = useState<GitCommandName | null>(null);

  const handleGitCommand =
    (name: GitCommandName, gitCommand: GitCommandValue) =>
    async (): Promise<void> => {
      setIsLoading(name);
      await GitService.executeCommand(cwd, gitCommand as GitCommand);
      setIsLoading(null);
    };

  const handleGitCommandLoadBranches =
    (name: GitCommandName, gitCommand: GitCommandValue) =>
    async (): Promise<void> => {
      setIsLoading(name);
      await GitService.executeCommand(cwd, gitCommand as GitCommand);
      await loadBranches();
      setIsLoading(null);
    };

  const handleConfirmGitCommand =
    (name: GitCommandName, gitCommand: GitCommandValue) =>
    async (): Promise<void> => {
      showModalConfirm({
        title: `Git Command: git ${
          Array.isArray(gitCommand) ? gitCommand.join(' ') : gitCommand
        }`,
        content: 'Are you sure you want to execute this command?',
        onClose: type => {
          if (type === 'accept') {
            handleGitCommand(name, gitCommand)();
          }
        },
      });
    };

  const getHandleClick = (
    name: GitCommandName,
    gitCommand: GitCommandValue,
    needsConfirmation: boolean
  ): (() => Promise<void>) => {
    if (needsConfirmation) {
      return handleConfirmGitCommand(name, gitCommand);
    }

    if (['fetch', 'pull'].includes(name)) {
      return handleGitCommandLoadBranches(name, gitCommand);
    }

    return handleGitCommand(name, gitCommand);
  };

  const buttonsDisabled = disabled || isLoading != null;

  const items: JSX.Element[] = Object.entries(GIT_COMMANDS).map(
    ([name, { label, value, needsConfirmation }]) => {
      return (
        <Button
          key={name}
          size="smaller"
          type={needsConfirmation ? 'tertiary' : 'primary'}
          stretch
          disabled={buttonsDisabled}
          Icon={name === isLoading ? Spinner : IconGit}
          onClick={getHandleClick(
            name as GitCommandName,
            value,
            needsConfirmation
          )}
        >
          {label}
        </Button>
      );
    }
  );

  return (
    <div className={c(styles.git_commands)}>
      <span>Git actions</span>
      <SettingsModal
        className={c(styles.git_commands_menu)}
        items={items}
        position="right"
      />
    </div>
  );
}

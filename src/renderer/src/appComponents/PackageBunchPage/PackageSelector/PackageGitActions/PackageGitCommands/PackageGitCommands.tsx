import { useState } from 'react';

import GitService from '@renderer/services/GitService';
import { Button, SettingsModal, Spinner, useModal } from 'fratch-ui/components';
import { IconGit } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import { GIT_COMMANDS } from './PackageGitConstants';
import type {
  GitCommand,
  GitCommandName,
  GitCommands,
  PackageGitCommandsProps,
} from './PackageGitConstantsProps';

import styles from './PackageGitCommands.module.css';

export default function PackageGitCommands({
  cwd,
  disabled,
  loadBranches,
}: PackageGitCommandsProps): JSX.Element {
  const { showModalConfirm } = useModal();
  const [isLoading, setIsLoading] = useState<GitCommandName | null>(null);

  const handleGitCommand =
    (name: GitCommandName, commands: GitCommands) =>
    async (): Promise<void> => {
      setIsLoading(name);
      for (const command of commands) {
        await GitService.executeCommand(cwd, command as GitCommand);
      }
      setIsLoading(null);
    };

  const handleGitCommandLoadBranches =
    (name: GitCommandName, commands: GitCommands) =>
    async (): Promise<void> => {
      setIsLoading(name);
      for (const command of commands) {
        await GitService.executeCommand(cwd, command as GitCommand);
      }
      await loadBranches();
      setIsLoading(null);
    };

  const handleConfirmGitCommand =
    (name: GitCommandName, gitCommand: GitCommands) =>
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
    commands: GitCommands,
    needsConfirmation: boolean
  ): (() => Promise<void>) => {
    if (needsConfirmation) {
      return handleConfirmGitCommand(name, commands);
    }

    if (['fetch', 'pull'].includes(name)) {
      return handleGitCommandLoadBranches(name, commands);
    }

    return handleGitCommand(name, commands);
  };

  const buttonsDisabled = disabled || isLoading != null;

  const items: JSX.Element[] = Object.entries(GIT_COMMANDS).map(
    ([name, { label, commands, needsConfirmation }]) => {
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
            commands,
            needsConfirmation
          )}
        >
          {label}
        </Button>
      );
    }
  );

  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div className={c(styles.git_commands)}>
      <a
        onClick={(event): void => {
          event.preventDefault();
          setVisible(state => !state);
        }}
      >
        Git actions
      </a>
      <SettingsModal
        className={c(styles.git_commands_menu)}
        items={items}
        position="right"
        visible={visible}
        onClose={(): void => {
          setVisible(false);
        }}
      />
    </div>
  );
}

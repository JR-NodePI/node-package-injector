import { useState } from 'react';

import GitService from '@renderer/services/GitService';
import { Button, SettingsModal, Spinner, useModal } from 'fratch-ui';
import { IconGit } from 'fratch-ui/components/Icons/Icons';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import { GIT_COMMANDS } from './PackageGitConstants';
import type {
  GitCommand,
  GitCommandName,
  GitCommandValue,
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

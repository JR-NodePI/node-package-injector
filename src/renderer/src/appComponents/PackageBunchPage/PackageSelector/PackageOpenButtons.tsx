import LinkButton from '@renderer/components/linkButton/LinkButton';
import NodePackage from '@renderer/models/NodePackage';
import TerminalService from '@renderer/services/TerminalService';
import { IconFolder, IconTerminal, IconVSCode } from 'fratch-ui';
import { c } from 'fratch-ui/helpers';

import styles from './PackageSelector.module.css';

const platform = window.api.os.platform();

type CommandConfig = null | {
  command: string;
  args: string[];
  title?: string;
};

const openCommand: CommandConfig =
  platform === 'win32'
    ? { command: 'explorer.exe', args: ['.'] }
    : platform === 'darwin'
    ? { command: 'open', args: ['.'] }
    : platform === 'linux'
    ? { command: 'xdg-open', args: ['.'] }
    : null;

const openInTerminalCommand: CommandConfig =
  platform === 'win32'
    ? {
        command: 'start-process',
        args: ['wsl'],
        title: 'Open in windows Terminal',
      }
    : platform === 'darwin'
    ? { command: 'open', args: ['-a', 'iTerm', '.'], title: 'Open in iTerm' }
    : platform === 'linux'
    ? {
        command: 'qterminal',
        args: ['.'],
        title: 'Open in terminal',
      }
    : null;

export default function PackageOpenButtons({
  nodePackage,
}: {
  nodePackage: NodePackage;
}): JSX.Element {
  const handleVSCodeClick = (): void => {
    TerminalService.executeCommand({
      command: 'bash',
      args: [
        window.api.PathService.getExtraResourcesScriptPath(
          'node_pi_open_vs_code.sh'
        ),
      ],
      cwd: nodePackage.cwd,
      syncMode: true,
    });
  };

  const handleFolderClick = (): void => {
    if (!openCommand) {
      return;
    }
    TerminalService.executeCommand({
      command: openCommand.command,
      args: openCommand.args,
      cwd: nodePackage.cwd,
      skipWSL: true,
      syncMode: true,
    });
  };

  const handleTerminalClick = (): void => {
    if (!openInTerminalCommand) {
      return;
    }
    TerminalService.executeCommand({
      command: openInTerminalCommand.command,
      args: openInTerminalCommand.args,
      cwd: nodePackage.cwd,
      skipWSL: true,
      syncMode: true,
    });
  };

  const areAvailable = nodePackage.isValidPackage;

  if (!areAvailable) {
    return <></>;
  }

  return (
    <>
      <span>|</span>

      <LinkButton
        key={'vscode'}
        title="Open in VS Code"
        className={c(styles.tool_button)}
        onClick={handleVSCodeClick}
      >
        <IconVSCode className={c(styles.tool_button_icon)} />
      </LinkButton>

      {openInTerminalCommand && (
        <LinkButton
          key={'terminal'}
          title={openInTerminalCommand.title}
          className={c(styles.tool_button)}
          onClick={handleTerminalClick}
        >
          <IconTerminal className={c(styles.tool_button_icon)} />
        </LinkButton>
      )}

      {openCommand && (
        <LinkButton
          key={'folder'}
          title="Open in folder"
          className={c(styles.tool_button)}
          onClick={handleFolderClick}
        >
          <IconFolder className={c(styles.tool_button_icon)} />
        </LinkButton>
      )}
    </>
  );
}

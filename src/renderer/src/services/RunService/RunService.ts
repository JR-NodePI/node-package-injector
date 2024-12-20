import { NODE_PI_FILE_PREFIX } from '@renderer/constants';
import type PackageBunch from '@renderer/models/PackageBunch';

import ConsoleGroup from '../ConsoleGroup';
import PathService from '../PathService';
import PersistService from '../PersistService';
import type { TerminalResponse } from '../TerminalService';
import TerminalService from '../TerminalService';
import WSLService from '../WSLService';
export type ProcessServiceResponse = TerminalResponse & { title: string };

export default class RunService {
  public static hasError(responses: ProcessServiceResponse[]): boolean {
    return responses.some(response => Boolean(response.error));
  }

  public static async resetKillAll(mustQuit = false): Promise<void> {
    const consoleGroup = new ConsoleGroup('Reset Kill All');
    consoleGroup.start();

    const isWSLActive = await PersistService.getItem<boolean>('isWSLActive');

    const packageBunches = await PersistService.getItem<PackageBunch[]>(
      'packageBunches'
    );
    const packageBunch = packageBunches.find(bunch => bunch.active);

    if (!packageBunch) {
      return;
    }

    const cwd = await PathService.getHomePath(isWSLActive);

    const TARGET_PACKAGE_CWD = await WSLService.cleanSWLRoot(
      packageBunch.targetPackage.cwd ?? '',
      packageBunch.targetPackage.cwd ?? ''
    );

    const DEPENDENCIES_CWD_S = await Promise.all(
      packageBunch.dependencies
        .map(
          async dep =>
            await WSLService.cleanSWLRoot(dep.cwd ?? '', dep.cwd ?? '')
        )
        .filter(Boolean)
    );

    const NODE_PI_RESET_KILL_ALL_BASH_FILE =
      PathService.getExtraResourcesScriptPath('node_pi_reset_kill_all.sh');

    if (mustQuit) {
      window.electron.ipcRenderer.send('reset-kill-all-quit', {
        NODE_PI_RESET_KILL_ALL_BASH_FILE,
        NODE_PI_FILE_PREFIX,
        TARGET_PACKAGE_CWD,
        DEPENDENCIES_CWD_S,
      });
    } else {
      const consoleGroup = new ConsoleGroup('Reset Kill All');
      consoleGroup.start();
      await TerminalService.executeCommand({
        command: 'bash',
        args: [
          NODE_PI_RESET_KILL_ALL_BASH_FILE,
          NODE_PI_FILE_PREFIX,
          TARGET_PACKAGE_CWD,
          ...DEPENDENCIES_CWD_S,
        ],
        cwd,
        skipWSL: true,
        traceOnTime: true,
      });
      consoleGroup.close();
    }

    consoleGroup.close();
  }
}

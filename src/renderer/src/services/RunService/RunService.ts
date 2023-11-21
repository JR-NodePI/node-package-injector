import { NODE_PI_FILE_PREFIX } from '@renderer/constants';
import type PackageBunch from '@renderer/models/PackageBunch';

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

  public static async resetAllDefer(mustQuit = false): Promise<void> {
    const packageBunches = await PersistService.getItem<PackageBunch[]>(
      'packageBunches'
    );
    const packageBunch = packageBunches.find(bunch => bunch.active);

    if (!packageBunch) {
      return;
    }

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

    const NODE_PI_KILL_ALL_DEFER_COMMAND =
      PathService.getExtraResourcesScriptPath('node_pi_kill_all_defer.sh');

    if (mustQuit) {
      window.electron.ipcRenderer.send('kill-all-defer-and-quit', {
        NODE_PI_KILL_ALL_DEFER_COMMAND,
        NODE_PI_FILE_PREFIX,
        TARGET_PACKAGE_CWD,
        DEPENDENCIES_CWD_S,
      });
    } else {
      await TerminalService.executeCommand({
        command: 'bash',
        args: [
          NODE_PI_KILL_ALL_DEFER_COMMAND,
          NODE_PI_FILE_PREFIX,
          TARGET_PACKAGE_CWD,
          ...DEPENDENCIES_CWD_S,
        ],
        cwd: TARGET_PACKAGE_CWD,
        skipWSL: true,
        traceOnTime: true,
      });
    }
  }
}

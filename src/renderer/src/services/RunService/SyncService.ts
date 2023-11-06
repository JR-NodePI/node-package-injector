import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';

import PathService from '../PathService';
import TerminalService from '../TerminalService';
import WSLService from '../WSLService';
import { type ProcessServiceResponse } from './RunService';

export default class SyncService {
  public static readonly SYNC_DIRECTORY_PREFIX = '.node-pi';

  public static async prepareSync({
    targetPackage,
    dependencies,
    abortController,
    isWSLActive,
  }: {
    targetPackage: NodePackage;
    dependencies: DependencyPackage[];
    abortController?: AbortController;
    isWSLActive?: boolean;
  }): Promise<ProcessServiceResponse[]> {
    const syncTitle = 'Creating package.json for monorepo sync';

    if (abortController?.signal.aborted) {
      return [
        {
          error: 'The process was aborted',
          title: syncTitle,
        },
      ];
    }

    const traceOnTime = true;
    const cwd = targetPackage.cwd ?? '';

    const promises = dependencies.map(async dep => {
      const targetPackageDir = PathService.normalizeWin32Path(
        window.api.path.join(
          await WSLService.cleanSWLRoot(cwd, cwd, traceOnTime),
          `${SyncService.SYNC_DIRECTORY_PREFIX}-${dep.packageName}`
        )
      );

      const srcPackageDir = PathService.normalizeWin32Path(
        await WSLService.cleanSWLRoot(cwd, dep.cwd ?? '', traceOnTime)
      );

      await TerminalService.executeCommand({
        command: 'bash',
        args: [
          PathService.getExtraResourcesScriptPath('rsync-watch.sh'),
          `"${srcPackageDir}"`,
          `"${targetPackageDir}"`,
        ],
        cwd,
        traceOnTime: traceOnTime,
        skipWSL: true,
        abortController,
      });
    });

    const response = await Promise.all(promises);

    return [{ ...response, title: syncTitle }];
  }
}

import { NODE_PI_FILE_PREFIX } from '@renderer/constants';
import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';

import PathService from '../PathService';
import TerminalService, { TerminalResponse } from '../TerminalService';
import WSLService from '../WSLService';
import { type ProcessServiceResponse } from './RunService';

export default class SyncService {
  public static async startSync({
    targetPackage,
    dependencies,
    abortController,
    syncAbortController,
  }: {
    targetPackage: NodePackage;
    dependencies: DependencyPackage[];
    abortController?: AbortController;
    syncAbortController?: AbortController;
  }): Promise<ProcessServiceResponse[]> {
    const syncTitle = `Sync mode ${targetPackage.packageName}`;
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

    const promises = dependencies.map<
      Promise<{ terminalResponse: TerminalResponse; packageName: string }>
    >(async dep => {
      const targetPackageDir = PathService.normalizeWin32Path(
        window.api.path.join(
          await WSLService.cleanSWLRoot(cwd, cwd, traceOnTime),
          `${NODE_PI_FILE_PREFIX}${dep.packageName}`
        )
      );

      const srcPackageDir = PathService.normalizeWin32Path(
        await WSLService.cleanSWLRoot(cwd, dep.cwd ?? '', traceOnTime)
      );

      const terminalResponse = await TerminalService.executeCommand({
        command: 'bash',
        args: [
          PathService.getExtraResourcesScriptPath('rsync_watch.sh'),
          `"${srcPackageDir}"`,
          `"${targetPackageDir}"`,
        ],
        cwd,
        traceOnTime: traceOnTime,
        skipWSL: true,
        abortController: syncAbortController,
        resolveTimeoutAfterFirstOutput: 5000,
      });

      return { terminalResponse, packageName: dep.packageName ?? '' };
    });

    const responses = await Promise.allSettled(promises);

    return responses.map(response => {
      if (response.status === 'fulfilled') {
        return {
          content: 'Sync finished',
          title: `Sync mode ${response.value.packageName}`,
        };
      }
      return { error: response.reason, title: syncTitle };
    });
  }

  public static async cleanSync({
    targetPackage,
    abortController,
  }: {
    targetPackage: NodePackage;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse> {
    const syncTitle = 'Stop sync mode';
    if (abortController?.signal.aborted) {
      return {
        error: 'The process was aborted',
        title: syncTitle,
      };
    }

    const cwd = targetPackage.cwd ?? '';

    const response = await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('rsync_restore.sh'),
        NODE_PI_FILE_PREFIX,
      ],
      cwd,
      abortController,
      skipWSL: true,
    });

    return { ...response, title: syncTitle };
  }
}

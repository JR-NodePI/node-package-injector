import { NODE_PI_FILE_PREFIX } from '@renderer/constants';
import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';

import GitService from '../GitService';
import NodeService from '../NodeService/NodeService';
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

    const hastAfterBuildScripts = (targetPackage.postBuildScripts ?? []).some(
      ({ scriptValue }) => Boolean(scriptValue)
    );

    const resolveTimeoutAfterFirstOutput = hastAfterBuildScripts ? 2000 : 0;

    const dependencyNames = dependencies
      .map(({ packageName }) => packageName)
      .filter(Boolean);

    // Add dependencies to .gitignore
    const gitignoreResponse = await GitService.gitignoreAdd(
      cwd,
      [`${NODE_PI_FILE_PREFIX}/`],
      syncAbortController
    );
    if (gitignoreResponse.error) {
      return [
        {
          ...gitignoreResponse,
          title: syncTitle,
        },
      ];
    }

    const isViteProject = await NodeService.checkViteConfig(cwd);
    const isCracoProject = await NodeService.checkCracoConfig(cwd);
    if (!isViteProject && !isCracoProject) {
      return [
        {
          error: 'The project is not a vite or craco project',
          title: syncTitle,
        },
      ];
    }

    // Add sync dependencies alias config
    const viteSyncResponse = await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath(
          isViteProject ? 'node_pi_sync_vite.sh' : 'node_pi_sync_craco.sh'
        ),
        `"${NODE_PI_FILE_PREFIX}"`,
        ...dependencyNames.map(dep => `"${dep}"`),
      ],
      cwd,
      traceOnTime: traceOnTime,
      skipWSL: true,
      abortController: syncAbortController,
    });
    if (viteSyncResponse.error) {
      return [
        {
          ...viteSyncResponse,
          title: syncTitle,
        },
      ];
    }

    // copy sync dependencies
    const dependenciesPromises = dependencies.map(async dependency =>
      SyncService.startSyncDependency({
        cwd,
        dependency,
        traceOnTime,
        syncAbortController,
        resolveTimeoutAfterFirstOutput,
      })
    );
    const dependenciesResponses = await Promise.allSettled(
      dependenciesPromises
    );

    return dependenciesResponses.map(result => {
      if (result.status === 'fulfilled') {
        const { terminalResponse, packageName } = result.value;
        const hasError = (terminalResponse.error ?? '').includes('Error');
        return {
          ...(hasError
            ? { error: terminalResponse.error }
            : { content: 'Sync finished' }),
          title: `Sync mode ${packageName}`,
        };
      }
      return { error: result.reason, title: syncTitle };
    });
  }

  private static async startSyncDependency({
    cwd,
    dependency,
    traceOnTime,
    syncAbortController,
    resolveTimeoutAfterFirstOutput,
  }: {
    cwd: string;
    dependency: DependencyPackage;
    traceOnTime: boolean;
    syncAbortController?: AbortController;
    resolveTimeoutAfterFirstOutput: number;
  }): Promise<{ terminalResponse: TerminalResponse; packageName: string }> {
    const targetPackageDir = PathService.normalizeWin32Path(
      window.api.path.join(await WSLService.cleanSWLRoot(cwd, cwd, traceOnTime))
    );

    if (!dependency.syncDirectories) {
      throw new Error(`${dependency.packageName} has no srcSyncPath`);
    }

    const srcDependencyDir = PathService.normalizeWin32Path(
      await WSLService.cleanSWLRoot(
        cwd,
        dependency.syncDirectories?.[0]?.srcPath ?? '',
        traceOnTime
      )
    );

    const terminalResponse = await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('node_pi_rsync_watch.sh'),
        `"${NODE_PI_FILE_PREFIX}"`,
        `"${targetPackageDir}"`,
        `"${srcDependencyDir}"`,
        `"${dependency.packageName}"`,
      ],
      cwd,
      traceOnTime: traceOnTime,
      skipWSL: true,
      abortController: syncAbortController,
      resolveTimeoutAfterFirstOutput,
    });

    return { terminalResponse, packageName: dependency.packageName ?? '' };
  }
}

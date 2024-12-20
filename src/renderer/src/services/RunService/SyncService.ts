import { NODE_PI_FILE_PREFIX } from '@renderer/constants';
import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';

import GitService from '../GitService';
import NodeService from '../NodeService/NodeService';
import PathService from '../PathService';
import TerminalService from '../TerminalService';
import WSLService from '../WSLService';
import RunService, { type ProcessServiceResponse } from './RunService';

const SYNC_RESOLVE_TIMEOUT = 2000;

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

    const syncResolveTimeout = hastAfterBuildScripts ? SYNC_RESOLVE_TIMEOUT : 0;

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
        syncResolveTimeout,
      })
    );
    const dependenciesResponses = await Promise.allSettled(
      dependenciesPromises
    );

    return dependenciesResponses.map(result => {
      if (result.status === 'fulfilled') {
        const { terminalResponses, packageName } = result.value;
        const hasError = RunService.hasError(terminalResponses);
        return {
          ...(hasError
            ? { error: terminalResponses[0].error }
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
    syncResolveTimeout,
  }: {
    cwd: string;
    dependency: DependencyPackage;
    traceOnTime: boolean;
    syncAbortController?: AbortController;
    syncResolveTimeout: number;
  }): Promise<{
    terminalResponses: ProcessServiceResponse[];
    packageName: string;
  }> {
    if (!dependency.syncDirectories) {
      throw new Error(`${dependency.packageName} has no srcSyncPath`);
    }

    const terminalResponses: ProcessServiceResponse[] = [];
    for (const [index, syncDirectory] of dependency.syncDirectories.entries()) {
      const resolveTimeoutAfterFirstOutput =
        syncResolveTimeout || index !== dependency.syncDirectories.length - 1
          ? SYNC_RESOLVE_TIMEOUT
          : 0;

      const targetPackageDir = PathService.normalizeWin32Path(
        window.api.path.join(
          await WSLService.cleanSWLRoot(cwd, cwd),
          NODE_PI_FILE_PREFIX,
          dependency.packageName ?? '',
          ...PathService.getPathDirectories(syncDirectory.targetPath ?? '')
        )
      );

      const srcDependencyDir = PathService.normalizeWin32Path(
        await WSLService.cleanSWLRoot(cwd, syncDirectory.srcPath)
      );

      const terminalResponse = await TerminalService.executeCommand({
        command: 'bash',
        args: [
          PathService.getExtraResourcesScriptPath('node_pi_rsync_watch.sh'),
          `"${NODE_PI_FILE_PREFIX}"`,
          `"${targetPackageDir}"`,
          `"${srcDependencyDir}"`,
        ],
        cwd,
        traceOnTime: traceOnTime,
        skipWSL: true,
        abortController: syncAbortController,
        resolveTimeoutAfterFirstOutput,
      });

      terminalResponses.push({
        ...terminalResponse,
        title: `Sync mode ${dependency.packageName}`,
      });
    }

    return { terminalResponses, packageName: dependency.packageName ?? '' };
  }
}

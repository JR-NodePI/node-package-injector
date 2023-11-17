import { NODE_PI_FILE_PREFIX } from '@renderer/constants';
import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';

import GitService from '../GitService';
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

    const hastAfterBuildScripts = (targetPackage.afterBuildScripts ?? []).some(
      ({ scriptValue }) => Boolean(scriptValue)
    );

    const resolveTimeoutAfterFirstOutput = hastAfterBuildScripts ? 2000 : 0;

    const dependencyNames = dependencies
      .map(({ packageName }) => packageName)
      .filter(Boolean);

    // Add dependencies to .gitignore
    const gitignoreResponse = await GitService.gitignoreAdd(
      cwd,
      dependencyNames.map(
        packageName => `${NODE_PI_FILE_PREFIX}${packageName}`
      ),
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

    // Add vite.config.js dependencies alias
    const viteSyncResponse = await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath(
          'node_pi_vite_config_add_sync_alias.sh'
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
      window.api.path.join(
        await WSLService.cleanSWLRoot(cwd, cwd, traceOnTime),
        `${NODE_PI_FILE_PREFIX}${dependency.packageName}`
      )
    );

    if (!dependency.srcSyncPath) {
      throw new Error(`${dependency.packageName} has no srcSyncPath`);
    }

    const srcPackageDir = PathService.normalizeWin32Path(
      await WSLService.cleanSWLRoot(
        cwd,
        dependency.srcSyncPath ?? '',
        traceOnTime
      )
    );

    const terminalResponse = await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('node_pi_rsync_watch.sh'),
        `"${srcPackageDir}"`,
        `"${targetPackageDir}"`,
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

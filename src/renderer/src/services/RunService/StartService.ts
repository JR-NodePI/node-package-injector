import { DependencyMode } from '@renderer/models/DependencyConstants';
import type DependencyPackage from '@renderer/models/DependencyPackage';
import type NodePackage from '@renderer/models/NodePackage';
import type PackageScript from '@renderer/models/PackageScript';

import NodeService from '../NodeService/NodeService';
import { RelatedDependencyProjection } from '../NodeService/NodeServiceTypes';
import PathService from '../PathService';
import BuildService from './BuildService';
import RunService, { type ProcessServiceResponse } from './RunService';
import SyncService from './SyncService';

export default class StartService {
  public static async run({
    additionalPackageScripts,
    targetPackage,
    dependencies,
    abortController,
    syncAbortController,
    isWSLActive,
    onTargetBuildStart,
    onDependenciesBuildStart,
    onDependenciesSyncStart,
    onAfterBuildStart,
  }: {
    additionalPackageScripts: PackageScript[];
    targetPackage: NodePackage;
    dependencies: DependencyPackage[];
    abortController?: AbortController;
    syncAbortController?: AbortController;
    isWSLActive?: boolean;
    onTargetBuildStart?: () => void;
    onDependenciesSyncPrepare?: () => void;
    onDependenciesBuildStart?: () => void;
    onDependenciesSyncStart?: () => void;
    onAfterBuildStart?: () => void;
  }): Promise<ProcessServiceResponse[]> {
    const successResponses: ProcessServiceResponse[] = [];

    const tmpDir = await PathService.getTmpDir({
      isWSLActive,
      skipWSLRoot: true,
      traceOnTime: true,
    });

    if (!tmpDir) {
      abortController?.abort();
      return [
        {
          error: 'Temporals (/tmp) system directory is not reachable',
          title: 'System error',
        },
      ];
    }

    const outputTitle = 'Invalid package';

    if (!targetPackage.cwd) {
      abortController?.abort();
      return [{ error: 'Package cwd is not valid', title: outputTitle }];
    }

    const packageName = targetPackage.packageName;
    if (!packageName) {
      abortController?.abort();
      return [
        {
          error: 'There is no dependency name in package.json',
          title: outputTitle,
        },
      ];
    }

    onTargetBuildStart?.();

    // Run package scripts
    const scriptsResponses = await BuildService.runPackageScripts({
      additionalPackageScripts,
      nodePackage: targetPackage,
      abortController,
      runScriptsTitle: 'Run target scripts',
    });
    if (RunService.hasError(scriptsResponses)) {
      abortController?.abort();
      return scriptsResponses;
    }

    const dependenciesToBuild = dependencies.filter(
      ({ mode }) => mode === DependencyMode.BUILD
    );
    if (dependenciesToBuild.length) {
      onDependenciesBuildStart?.();
    }

    const sortedRelatedDependencies =
      await NodeService.getDependenciesSortedByHierarchy(dependenciesToBuild);

    // Run dependencies in build mode
    const dependenciesResponses = await StartService.runBuildDependencies({
      additionalPackageScripts,
      sortedRelatedDependencies,
      tmpDir,
      abortController,
    });
    if (RunService.hasError(dependenciesResponses.flat())) {
      abortController?.abort();
      return dependenciesResponses.flat();
    }

    successResponses.push(...dependenciesResponses.flat());

    // Inject dependencies
    const targetDependencies = sortedRelatedDependencies.map(
      ({ dependency }) => dependency
    );
    const injectDependenciesResponses = await BuildService.injectDependencies({
      targetPackage,
      dependencies: targetDependencies,
      tmpDir,
      abortController,
    });
    if (RunService.hasError(injectDependenciesResponses)) {
      abortController?.abort();
      return injectDependenciesResponses;
    }

    // Run run sync dependencies
    const syncResponses = await StartService.runSyncDependencies({
      targetPackage,
      dependencies,
      abortController,
      syncAbortController,
      onDependenciesSyncStart,
    });
    if (RunService.hasError(syncResponses)) {
      abortController?.abort();
      return syncResponses;
    }

    successResponses.push(...syncResponses);

    onAfterBuildStart?.();

    // Run after build dependencies package scripts
    const afterBuildScriptsResponses = await BuildService.runPackageScripts({
      additionalPackageScripts,
      nodePackage: targetPackage,
      abortController,
      runScriptsTitle: 'Run after build target scripts',
      mustRunAfterBuild: true,
    });
    if (RunService.hasError(afterBuildScriptsResponses)) {
      abortController?.abort();
      return afterBuildScriptsResponses;
    }

    return successResponses;
  }

  private static async runSyncDependencies({
    targetPackage,
    dependencies,
    abortController,
    syncAbortController,
    onDependenciesSyncStart,
  }: {
    targetPackage: NodePackage;
    dependencies: DependencyPackage[];
    abortController?: AbortController;
    syncAbortController?: AbortController;
    onDependenciesSyncStart?: () => void;
  }): Promise<ProcessServiceResponse[]> {
    const dependenciesToSync = dependencies.filter(
      ({ mode }) => mode === DependencyMode.SYNC
    );

    if (dependenciesToSync.length) {
      onDependenciesSyncStart?.();

      const syncResponses = await SyncService.startSync({
        targetPackage,
        dependencies: dependenciesToSync,
        abortController,
        syncAbortController,
      });

      syncAbortController?.signal.addEventListener(
        'abort',
        async (): Promise<void> => {
          const cleanSyncResponse = await SyncService.cleanSync({
            targetPackage,
          });

          console.log('>>>----->> cleanSyncResponse', cleanSyncResponse);

          // if (cleanSyncResponse.error) {
          //   abortController?.abort();
          //   return [cleanSyncResponse];
          // }
        }
      );

      return syncResponses;
    }

    return [];
  }

  private static async runBuildDependencies({
    additionalPackageScripts,
    sortedRelatedDependencies,
    tmpDir,
    abortController,
  }: {
    additionalPackageScripts: PackageScript[];
    sortedRelatedDependencies: RelatedDependencyProjection[];
    tmpDir: string;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse[][]> {
    const dependenciesResponses = await BuildService.buildDependencies({
      additionalPackageScripts,
      sortedRelatedDependencies,
      tmpDir,
      abortController,
    });

    return dependenciesResponses;
  }
}

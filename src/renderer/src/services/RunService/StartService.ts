import { promiseAllSequentially } from '@renderer/helpers/promisesHelpers';
import { DependencyMode } from '@renderer/models/DependencyConstants';
import type DependencyPackage from '@renderer/models/DependencyPackage';
import type NodePackage from '@renderer/models/NodePackage';
import type PackageScript from '@renderer/models/PackageScript';

import NodeService from '../NodeService/NodeService';
import { RelatedDependencyProjection } from '../NodeService/NodeServiceTypes';
import type { PackageManager } from './BuildService';
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
    onTargetBuildStart?: () => void;
    onDependenciesSyncPrepare?: () => void;
    onDependenciesBuildStart?: () => void;
    onDependenciesSyncStart?: () => void;
    onAfterBuildStart?: () => void;
  }): Promise<ProcessServiceResponse[]> {
    const successResponses: ProcessServiceResponse[] = [];

    await RunService.resetKillAll();

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

    const packageManager = (await NodeService.checkYarn(targetPackage.cwd))
      ? 'yarn'
      : (await NodeService.checkPnpm(targetPackage.cwd))
      ? 'pnpm'
      : 'npm';

    onTargetBuildStart?.();

    // Run package pre build scripts
    const scriptsResponses = await BuildService.runPackageScripts({
      abortController,
      additionalPackageScripts,
      nodePackage: targetPackage,
      packageManager,
      runScriptsTitle: 'Run target scripts (pre build)',
      scriptsType: 'scripts',
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

    //Run dependency INSTALLATION scripts
    const dependenciesInstallScriptsPromises = dependenciesToBuild.map(
      dependency => () =>
        BuildService.runPackageScripts({
          abortController,
          additionalPackageScripts,
          nodePackage: dependency,
          packageManager,
          runScriptsTitle: 'Run dependency INSTALLATION scripts',
          scriptsType: 'preBuildScripts',
        })
    );

    const dependenciesInstallScriptsResponses = await promiseAllSequentially<
      ProcessServiceResponse[]
    >(dependenciesInstallScriptsPromises);
    if (RunService.hasError(dependenciesInstallScriptsResponses.flat())) {
      abortController?.abort();
      return dependenciesInstallScriptsResponses.flat();
    }

    // Get sorted dependencies
    const sortedRelatedDependencies =
      await NodeService.getDependenciesSortedByHierarchy(dependenciesToBuild);

    // Run dependencies in build mode
    const dependenciesResponses = await StartService.runBuildDependencies({
      abortController,
      additionalPackageScripts,
      packageManager,
      sortedRelatedDependencies,
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
      abortController,
      dependencies: targetDependencies,
      packageManager,
      targetPackage,
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
      abortController,
      additionalPackageScripts,
      nodePackage: targetPackage,
      packageManager,
      runScriptsTitle: 'Run target scripts (post build)',
      scriptsType: 'postBuildScripts',
    });

    if (!syncAbortController?.signal.aborted) {
      syncAbortController?.abort();
    }

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

      return syncResponses;
    }

    return [];
  }

  private static async runBuildDependencies({
    additionalPackageScripts,
    sortedRelatedDependencies,
    abortController,
    packageManager,
  }: {
    additionalPackageScripts: PackageScript[];
    sortedRelatedDependencies: RelatedDependencyProjection[];
    abortController?: AbortController;
    packageManager: PackageManager;
  }): Promise<ProcessServiceResponse[][]> {
    const dependenciesResponses = await BuildService.buildDependencies({
      additionalPackageScripts,
      sortedRelatedDependencies,
      abortController,
      packageManager,
    });

    return dependenciesResponses;
  }
}

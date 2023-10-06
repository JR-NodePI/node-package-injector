import { DependencyMode } from '@renderer/models/DependencyConstants';
import type DependencyPackage from '@renderer/models/DependencyPackage';
import type NodePackage from '@renderer/models/NodePackage';
import type PackageScript from '@renderer/models/PackageScript';
import { type TerminalResponse } from '@renderer/services/TerminalService';

import BuildProcessService from './BuildProcessService';
import NodeService from './NodeService/NodeService';
import { RelatedDependencyProjection } from './NodeService/NodeServiceTypes';
import PathService from './PathService';

type ProcessServiceResponse = TerminalResponse & { title: string };

const hasError = (responses: ProcessServiceResponse[]): boolean =>
  responses.some(response => Boolean(response.error));

export default class RunProcessService {
  public static async run({
    additionalPackageScripts,
    targetPackage,
    dependencies,
    abortController,
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
    isWSLActive?: boolean;
    onTargetBuildStart?: () => void;
    onDependenciesBuildStart?: () => void;
    onDependenciesSyncStart?: () => void;
    onAfterBuildStart?: () => void;
  }): Promise<ProcessServiceResponse[]> {
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

    const cwd = targetPackage.cwd ?? '';

    const packageName = await NodeService.getPackageName(cwd);
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
    const scriptsResponses = await BuildProcessService.runPackageScripts({
      additionalPackageScripts,
      packageScripts: targetPackage.scripts,
      cwd,
      packageName,
      abortController,
      runScriptsTitle: 'Run target scripts',
    });
    if (hasError(scriptsResponses)) {
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
    const dependenciesResponses = await RunProcessService.runDependencies({
      additionalPackageScripts,
      sortedRelatedDependencies,
      tmpDir,
      abortController,
    });
    if (hasError(dependenciesResponses.flat())) {
      abortController?.abort();
      return dependenciesResponses.flat();
    }

    // Inject dependencies
    const targetDependencies = sortedRelatedDependencies.map(
      ({ dependency }) => dependency
    );
    const injectDependenciesResponses =
      await BuildProcessService.injectDependencies({
        targetPackage,
        dependencies: targetDependencies,
        tmpDir,
        abortController,
      });
    if (hasError(injectDependenciesResponses)) {
      abortController?.abort();
      return injectDependenciesResponses;
    }

    onAfterBuildStart?.();

    // Run after build dependencies package scripts
    const afterBuildScriptsResponses =
      await BuildProcessService.runPackageScripts({
        additionalPackageScripts,
        packageScripts: targetPackage.afterBuildScripts,
        cwd,
        packageName,
        abortController,
        runScriptsTitle: 'Run after build target scripts',
      });
    if (hasError(afterBuildScriptsResponses)) {
      abortController?.abort();
      return afterBuildScriptsResponses;
    }

    // Sync dependencies
    const dependenciesToSync = dependencies.filter(
      ({ mode }) => mode === DependencyMode.SYNC
    );
    if (dependenciesToSync.length) {
      onDependenciesSyncStart?.();
      // TODO: run sync by SyncProcessService
    }

    return dependenciesResponses.flat();
  }

  private static async runDependencies({
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
    const dependenciesResponses = await BuildProcessService.buildDependencies({
      additionalPackageScripts,
      sortedRelatedDependencies,
      tmpDir,
      abortController,
    });

    return dependenciesResponses;
  }
}

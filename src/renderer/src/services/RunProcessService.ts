import { promiseAllSequentially } from '@renderer/helpers/promisesHelpers';
import { DependencyMode } from '@renderer/models/DependencyConstants';
import type DependencyPackage from '@renderer/models/DependencyPackage';
import type NodePackage from '@renderer/models/NodePackage';
import type PackageScript from '@renderer/models/PackageScript';
import GitService from '@renderer/services/GitService';
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

    // package git pull
    const gitPullResponses = await RunProcessService.gitPullPackage({
      nodePackage: targetPackage,
      packageName,
    });
    if (hasError(gitPullResponses)) {
      abortController?.abort();
      return gitPullResponses;
    }

    // Run package scripts
    const scriptsResponses = await BuildProcessService.runPackageScripts({
      additionalPackageScripts,
      packageScripts: targetPackage.scripts,
      cwd,
      packageName,
      abortController,
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

    // Run dependencies in build mode
    const dependenciesResponses = await RunProcessService.runDependencies({
      additionalPackageScripts,
      dependencies: dependenciesToBuild,
      tmpDir,
      abortController,
    });
    if (hasError(dependenciesResponses.flat())) {
      abortController?.abort();
      return dependenciesResponses.flat();
    }

    // Inject dependencies
    const injectDependenciesResponses =
      await BuildProcessService.injectDependencies({
        targetPackage,
        dependencies: dependenciesToBuild,
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

  private static async gitPullPackage({
    nodePackage,
    packageName,
  }: {
    nodePackage: NodePackage;
    packageName: string;
  }): Promise<ProcessServiceResponse[]> {
    if (nodePackage.performGitPull) {
      const output = await GitService.pull(nodePackage.cwd ?? '');

      if (output.error) {
        return [{ ...output, title: `Git pull: ${packageName}` }];
      }
    }

    return [];
  }

  private static async runDependencies({
    additionalPackageScripts,
    dependencies,
    tmpDir,
    abortController,
  }: {
    additionalPackageScripts: PackageScript[];
    dependencies: DependencyPackage[];
    tmpDir: string;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse[][]> {
    const sortedRelatedDependencies =
      await NodeService.getDependenciesSortedByHierarchy(dependencies);

    const gitPullDependenciesResponses =
      await RunProcessService.gitPullDependencies(sortedRelatedDependencies);

    if (hasError(gitPullDependenciesResponses.flat())) {
      abortController?.abort();
      return gitPullDependenciesResponses;
    }

    const dependenciesResponses = await BuildProcessService.buildDependencies({
      additionalPackageScripts,
      sortedRelatedDependencies,
      tmpDir,
      abortController,
    });

    return dependenciesResponses;
  }

  private static async gitPullDependencies(
    sortedRelatedDependencies: RelatedDependencyProjection[]
  ): Promise<ProcessServiceResponse[][]> {
    const gitPullDependenciesPromises = sortedRelatedDependencies.map(
      ({ dependencyName, dependency }) =>
        () =>
          RunProcessService.gitPullPackage({
            nodePackage: dependency,
            packageName: dependencyName,
          })
    );
    const gitPullDependenciesResponses = await promiseAllSequentially<
      ProcessServiceResponse[]
    >(gitPullDependenciesPromises);

    return gitPullDependenciesResponses;
  }
}

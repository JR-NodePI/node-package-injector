import { promiseAllSequentially } from '@renderer/helpers/promisesHelpers';
import { DependencyMode } from '@renderer/models/DependencyConstants';
import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageScript from '@renderer/models/PackageScript';
import TerminalService, {
  type TerminalResponse,
} from '@renderer/services/TerminalService';

import NodeService from './NodeService/NodeService';
import { RelatedDependencyProjection } from './NodeService/NodeServiceTypes';
import PathService from './PathService';
import WSLService from './WSLService';

type ProcessServiceResponse = TerminalResponse & { title: string };

const hasError = (responses: ProcessServiceResponse[]): boolean =>
  responses.some(response => Boolean(response.error));

export default class BuildProcessService {
  public static async buildDependencies({
    sortedRelatedDependencies,
    tmpDir,
    abortController,
  }: {
    sortedRelatedDependencies: RelatedDependencyProjection[];
    tmpDir: string;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse[][]> {
    if (abortController?.signal.aborted) {
      return [
        [
          {
            error: 'The process was aborted',
            title: `Build all dependencies`,
          },
        ],
      ];
    }

    const dependenciesToBuild = sortedRelatedDependencies.filter(
      ({ dependency }) => dependency.mode === DependencyMode.BUILD
    );

    const dependenciesPromises = dependenciesToBuild.map(
      relatedDependency => () =>
        BuildProcessService.buildSingleDependency({
          relatedDependency,
          tmpDir,
          abortController,
        })
    );

    const dependenciesResponses =
      promiseAllSequentially<ProcessServiceResponse[]>(dependenciesPromises);

    return dependenciesResponses;
  }

  private static async buildSingleDependency({
    relatedDependency,
    tmpDir,
    abortController,
  }: {
    relatedDependency: RelatedDependencyProjection;
    tmpDir: string;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse[]> {
    const outputTitle = `Build dependency: ${relatedDependency.dependencyName}`;

    if (abortController?.signal.aborted) {
      return [
        {
          error: 'The process was aborted',
          title: outputTitle,
        },
      ];
    }

    const { dependency } = relatedDependency;
    const depCwd = dependency.cwd ?? '';
    const depName = relatedDependency.dependencyName;

    const handleOnAbort = async (): Promise<void> => {
      await NodeService.restoreFakePackageVersion(depCwd);
    };
    abortController?.signal.addEventListener('abort', handleOnAbort);

    // Inject fake package version
    const outputFakeVersion = await NodeService.injectFakePackageVersion(
      depCwd,
      abortController
    );

    if (outputFakeVersion.error) {
      return [
        {
          ...outputFakeVersion,
          title: `Injecting fake package version: "${depName}"`,
        },
      ];
    }

    // Run dependencies scripts
    const scriptsResponses = await BuildProcessService.runPackageScripts({
      packageScripts: dependency.scripts,
      cwd: depCwd,
      packageName: depName,
      abortController,
    });

    // Restore fake package version
    const outputRestoreVersion = await NodeService.restoreFakePackageVersion(
      depCwd,
      abortController
    );
    if (outputRestoreVersion.error) {
      scriptsResponses.push({
        ...outputRestoreVersion,
        title: `Restoring package.json: "${depName}"`,
      });
    }
    abortController?.signal.removeEventListener('abort', handleOnAbort);

    if (hasError(scriptsResponses)) {
      abortController?.abort();
      return scriptsResponses;
    }

    // Inject dependencies
    const injectDependenciesResponses =
      await BuildProcessService.injectDependencies({
        targetPackage: dependency,
        dependencies: relatedDependency.subDependencies,
        tmpDir,
        abortController,
      });

    if (hasError(injectDependenciesResponses)) {
      abortController?.abort();
      return injectDependenciesResponses;
    }

    return [...scriptsResponses, { title: outputTitle }];
  }

  public static async runPackageScripts({
    packageScripts = [],
    cwd,
    packageName,
    abortController,
  }: {
    packageScripts?: PackageScript[];
    cwd: string;
    packageName?: string;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse[]> {
    if (abortController?.signal.aborted) {
      return [
        {
          error: 'The process was aborted',
          title: `Run package scripts: "${packageName}"`,
        },
      ];
    }

    const scriptsPromises = packageScripts
      .filter(script => Boolean(script.scriptName.trim()))
      .map(
        packageScript => () =>
          BuildProcessService.runPackageSingleScript({
            packageScript,
            cwd,
            packageName,
            abortController,
          })
      );

    const scriptsResponses =
      await promiseAllSequentially<ProcessServiceResponse>(scriptsPromises);

    return scriptsResponses;
  }

  private static async runPackageSingleScript({
    packageScript,
    cwd,
    packageName,
    abortController,
  }: {
    packageScript: PackageScript;
    cwd: string;
    packageName?: string;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse> {
    const outputTitle = `Run package script: ${packageName} - ${packageScript.scriptName}`;

    if (abortController?.signal.aborted) {
      return {
        error: 'The process was aborted',
        title: outputTitle,
      };
    }

    const script = (await NodeService.checkYarn(cwd))
      ? `yarn ${packageScript.scriptName}`
      : (await NodeService.checkPnpm(cwd))
      ? `pnpm run ${packageScript.scriptName}`
      : `npm run ${packageScript.scriptName}`;

    // if (ADDITIONAL_PACKAGE_SCRIPTS[packageScript.scriptName] != null) {
    //   script = ADDITIONAL_PACKAGE_SCRIPTS[packageScript.scriptName].scriptValue;
    // }

    const output = await NodeService.runScript(cwd, script, abortController);

    if (output.error) {
      return {
        ...output,
        title: outputTitle,
      };
    }

    return { title: outputTitle };
  }

  public static async injectDependencies({
    targetPackage,
    dependencies,
    tmpDir,
    abortController,
  }: {
    targetPackage: NodePackage;
    tmpDir: string;
    dependencies: DependencyPackage[];
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse[]> {
    if (abortController?.signal.aborted) {
      return [
        {
          error: 'The process was aborted',
          title: `Injecting all dependencies`,
        },
      ];
    }

    const injectPromises = dependencies.map(dependency => async () => {
      const depDirName = PathService.getDirName(dependency.cwd);
      const outputTitle = `Dependency injection: ${depDirName}`;

      const dependencyName = await NodeService.getPackageName(
        dependency.cwd ?? ''
      );

      if (!dependencyName) {
        abortController?.abort();
        return {
          error: 'There is no dependency name in package.json',
          title: outputTitle,
        };
      }

      const packageBuildedPathResponse =
        await NodeService.getPackageBuildedPath(dependency.cwd ?? '');
      if (packageBuildedPathResponse.error) {
        abortController?.abort();
        return {
          ...packageBuildedPathResponse,
          title: outputTitle,
        };
      }

      const dependencyPackagePath = packageBuildedPathResponse.content ?? '';

      if (dependencyPackagePath) {
        return await BuildProcessService.injectSingleDependency({
          targetPackage,
          dependencyPackagePath,
          dependencyName,
          tmpDir,
          abortController,
        });
      } else {
        return {
          error: `The dependency builded package file does not exist.`,
          title: outputTitle,
        };
      }
    });

    const injectResponses =
      await promiseAllSequentially<ProcessServiceResponse>(injectPromises);

    if (hasError(injectResponses)) {
      abortController?.abort();
      return injectResponses;
    }

    return injectResponses;
  }

  private static async injectSingleDependency({
    targetPackage,
    dependencyPackagePath,
    dependencyName,
    tmpDir,
    abortController,
  }: {
    targetPackage: NodePackage;
    dependencyPackagePath: string;
    dependencyName: string;
    tmpDir: string;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse> {
    const outputTitle = `Dependency injection: ${dependencyName}`;

    if (abortController?.signal.aborted) {
      return {
        error: 'The process was aborted',
        title: outputTitle,
      };
    }

    const traceOnTime = true;

    const cleanDependencyPackagePath = await WSLService.cleanSWLRoot(
      targetPackage.cwd ?? '',
      dependencyPackagePath,
      traceOnTime
    );
    const tmpDependencyDir = PathService.normalizeWin32Path(
      window.api.path.join(tmpDir, dependencyName, '/')
    );
    const targetPackageDir = await WSLService.cleanSWLRoot(
      targetPackage.cwd ?? '',
      window.api.path.join(
        targetPackage.cwd ?? '',
        '/node_modules/',
        dependencyName,
        '/'
      ),
      traceOnTime
    );

    const injectionOutput = await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('inject_package.sh'),
        `"${dependencyName}"`,
        `"${cleanDependencyPackagePath}"`,
        `"${tmpDependencyDir}"`,
        `"${targetPackageDir}"`,
      ],
      cwd: targetPackage.cwd ?? '',
      traceOnTime,
      abortController,
    });

    if (injectionOutput.error) {
      return {
        ...injectionOutput,
        title: outputTitle,
      };
    }

    return { title: outputTitle };
  }
}

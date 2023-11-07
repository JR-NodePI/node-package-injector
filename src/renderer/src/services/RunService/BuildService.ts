import { promiseAllSequentially } from '@renderer/helpers/promisesHelpers';
import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageScript from '@renderer/models/PackageScript';
import TerminalService, {
  type TerminalResponse,
} from '@renderer/services/TerminalService';

import NodeService from '../NodeService/NodeService';
import { RelatedDependencyProjection } from '../NodeService/NodeServiceTypes';
import PathService from '../PathService';
import WSLService from '../WSLService';
import RunService, { type ProcessServiceResponse } from './RunService';

export default class BuildService {
  public static async buildDependencies({
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

    const dependenciesPromises = sortedRelatedDependencies.map(
      relatedDependency => () =>
        BuildService.buildSingleDependency({
          additionalPackageScripts,
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
    additionalPackageScripts,
    relatedDependency,
    tmpDir,
    abortController,
  }: {
    additionalPackageScripts: PackageScript[];
    relatedDependency: RelatedDependencyProjection;
    tmpDir: string;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse[]> {
    const outputTitle = `Build dependency: ${
      relatedDependency.dependency.packageName ?? ''
    }`;

    if (abortController?.signal.aborted) {
      return [
        {
          error: 'The process was aborted',
          title: outputTitle,
        },
      ];
    }

    // Inject sub-dependencies
    const { dependency, subDependencies } = relatedDependency;
    const injectDependenciesResponses = await BuildService.injectDependencies({
      targetPackage: dependency,
      dependencies: subDependencies,
      tmpDir,
      abortController,
    });

    if (RunService.hasError(injectDependenciesResponses)) {
      abortController?.abort();
      return injectDependenciesResponses;
    }

    // Run dependencies scripts
    const scriptsResponses = await BuildService.runPackageScripts({
      additionalPackageScripts,
      nodePackage: dependency,
      abortController,
      runScriptsTitle: 'Run dependency scripts',
    });

    if (RunService.hasError(scriptsResponses)) {
      abortController?.abort();
      return scriptsResponses;
    }

    return [...scriptsResponses, { title: outputTitle }];
  }

  public static async runPackageScripts({
    additionalPackageScripts,
    nodePackage,
    abortController,
    runScriptsTitle = 'Run package scripts',
    mustRunAfterBuild = false,
  }: {
    additionalPackageScripts: PackageScript[];
    nodePackage: NodePackage;
    abortController?: AbortController;
    runScriptsTitle?: string;
    mustRunAfterBuild?: boolean;
  }): Promise<ProcessServiceResponse[]> {
    if (abortController?.signal.aborted) {
      return [
        {
          error: 'The process was aborted',
          title: `${runScriptsTitle}: "${nodePackage.packageName}"`,
        },
      ];
    }

    const cwd = nodePackage.cwd ?? '';
    const packageName = nodePackage.packageName ?? ' ';

    const scripts = mustRunAfterBuild
      ? nodePackage.afterBuildScripts
      : nodePackage.scripts;

    const filledScripts = (scripts ?? []).filter(script =>
      Boolean(script.scriptName.trim())
    );
    const hasScripts = Boolean(filledScripts?.length);

    let handleOnAbort: (() => Promise<void>) | null = null;

    if (hasScripts) {
      // eslint-disable-next-line no-console
      console.log(`>>>----->> ${runScriptsTitle}: `, nodePackage.packageName);

      // Inject fake package version
      const outputFakeVersion = await NodeService.injectFakePackageVersion(
        nodePackage,
        abortController
      );

      if (outputFakeVersion.error) {
        return [
          {
            ...outputFakeVersion,
            title: `Injecting fake package version: "${nodePackage.packageName}"`,
          },
        ];
      }

      handleOnAbort = async (): Promise<void> => {
        await NodeService.restoreFakePackageVersion(nodePackage.cwd ?? '');
      };
      abortController?.signal.addEventListener('abort', handleOnAbort);
    }

    const scriptsPromises = filledScripts.map(
      packageScript => () =>
        BuildService.runPackageSingleScript({
          additionalPackageScripts,
          packageScript,
          cwd,
          packageName,
          abortController,
        })
    );

    const scriptsResponses =
      await promiseAllSequentially<ProcessServiceResponse>(scriptsPromises);

    let outputRestoreVersion: TerminalResponse | null = null;

    if (hasScripts && !abortController?.signal.aborted) {
      // Restore fake package version
      outputRestoreVersion = await NodeService.restoreFakePackageVersion(
        cwd,
        abortController
      );
    }

    if (outputRestoreVersion?.error) {
      scriptsResponses.push({
        ...outputRestoreVersion,
        title: `Restoring package.json: "${packageName}"`,
      });
    }

    if (handleOnAbort != null) {
      abortController?.signal.removeEventListener('abort', handleOnAbort);
    }

    return scriptsResponses;
  }

  private static async runPackageSingleScript({
    additionalPackageScripts,
    packageScript,
    cwd,
    packageName,
    abortController,
  }: {
    additionalPackageScripts: PackageScript[];
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

    let script = (await NodeService.checkYarn(cwd))
      ? `yarn ${packageScript.scriptName}`
      : (await NodeService.checkPnpm(cwd))
      ? `pnpm run ${packageScript.scriptName}`
      : `npm run ${packageScript.scriptName}`;

    const isAdditionalScript = additionalPackageScripts.find(
      ({ id }) => id === packageScript.id
    );
    if (isAdditionalScript) {
      script = packageScript.scriptValue;
    }

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
      const outputTitle = `Dependency injection: ${
        dependency.packageName ?? ''
      }`;

      if (!dependency.packageName) {
        abortController?.abort();
        return {
          error: 'There is no dependency name in package.json',
          title: outputTitle,
        };
      }

      const packageBuildedPathResponse =
        await NodeService.getPackageBuildedPath(dependency);
      if (packageBuildedPathResponse.error) {
        abortController?.abort();
        return {
          ...packageBuildedPathResponse,
          title: outputTitle,
        };
      }

      const dependencyPackagePath = packageBuildedPathResponse.content ?? '';

      if (dependencyPackagePath) {
        return await BuildService.injectSingleDependency({
          targetPackage,
          dependencyPackagePath,
          dependencyName: dependency.packageName,
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

    if (RunService.hasError(injectResponses)) {
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
    const targetPackageDir = PathService.normalizeWin32Path(
      await WSLService.cleanSWLRoot(
        targetPackage.cwd ?? '',
        window.api.path.join(
          targetPackage.cwd ?? '',
          '/node_modules/',
          dependencyName,
          '/'
        ),
        traceOnTime
      )
    );

    // eslint-disable-next-line no-console
    console.log(
      '>>>----->> Injecting: ',
      dependencyName,
      '->',
      targetPackage.packageName ?? ''
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

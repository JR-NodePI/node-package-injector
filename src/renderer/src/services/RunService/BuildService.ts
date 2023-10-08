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

    // Inject sub-dependencies
    const injectDependenciesResponses = await BuildService.injectDependencies({
      targetPackage: dependency,
      dependencies: relatedDependency.subDependencies,
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
      packageScripts: dependency.scripts,
      cwd: depCwd,
      packageName: depName,
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
    packageScripts = [],
    cwd,
    packageName,
    abortController,
    runScriptsTitle = 'Run package scripts',
  }: {
    additionalPackageScripts: PackageScript[];
    packageScripts?: PackageScript[];
    cwd: string;
    packageName?: string;
    abortController?: AbortController;
    runScriptsTitle?: string;
  }): Promise<ProcessServiceResponse[]> {
    if (abortController?.signal.aborted) {
      return [
        {
          error: 'The process was aborted',
          title: `${runScriptsTitle}: "${packageName}"`,
        },
      ];
    }

    const filledScripts = packageScripts.filter(script =>
      Boolean(script.scriptName.trim())
    );
    const hasScripts = Boolean(filledScripts?.length);

    let handleOnAbort: (() => Promise<void>) | null = null;

    if (hasScripts) {
      // eslint-disable-next-line no-console
      console.log(`>>>----->> ${runScriptsTitle}: `, packageName);

      // Inject fake package version
      const outputFakeVersion = await NodeService.injectFakePackageVersion(
        cwd,
        abortController
      );

      if (outputFakeVersion.error) {
        return [
          {
            ...outputFakeVersion,
            title: `Injecting fake package version: "${packageName}"`,
          },
        ];
      }

      handleOnAbort = async (): Promise<void> => {
        await NodeService.restoreFakePackageVersion(cwd);
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
        return await BuildService.injectSingleDependency({
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

    const targetPackageDirName = PathService.getDirName(targetPackage.cwd);

    // eslint-disable-next-line no-console
    console.log(
      '>>>----->> Injecting: ',
      dependencyName,
      '->',
      targetPackageDirName
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

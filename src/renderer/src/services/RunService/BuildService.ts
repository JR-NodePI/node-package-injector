import { NODE_PI_FILE_PREFIX } from '@renderer/constants';
import { promiseAllSequentially } from '@renderer/helpers/promisesHelpers';
import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageScript from '@renderer/models/PackageScript';
import TerminalService from '@renderer/services/TerminalService';

import ConsoleGroup from '../ConsoleGroup';
import NodeService from '../NodeService/NodeService';
import { RelatedDependencyProjection } from '../NodeService/NodeServiceTypes';
import PathService from '../PathService';
import WSLService from '../WSLService';
import RunService, { type ProcessServiceResponse } from './RunService';

export default class BuildService {
  public static async buildDependencies({
    additionalPackageScripts,
    sortedRelatedDependencies,
    abortController,
  }: {
    additionalPackageScripts: PackageScript[];
    sortedRelatedDependencies: RelatedDependencyProjection[];
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
    abortController,
  }: {
    additionalPackageScripts: PackageScript[];
    relatedDependency: RelatedDependencyProjection;
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
      ? nodePackage.postBuildScripts
      : nodePackage.scripts;

    const filledScripts = (scripts ?? []).filter(script =>
      Boolean(script.scriptName.trim())
    );
    const hasScripts = Boolean(filledScripts?.length);

    if (hasScripts) {
      const consoleGroup = new ConsoleGroup(
        `>>>----->> ${runScriptsTitle}: ${nodePackage.packageName}`
      );
      consoleGroup.start();

      // Inject fake package version
      const outputFakeVersion = await NodeService.injectFakePackageVersion(
        nodePackage,
        abortController
      );

      consoleGroup.close();

      if (outputFakeVersion.error) {
        return [
          {
            ...outputFakeVersion,
            title: `Injecting fake package version: "${nodePackage.packageName}"`,
          },
        ];
      }
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

    const consoleGroup = new ConsoleGroup(`>>>----->> ${outputTitle}`, {
      abortController,
    });
    consoleGroup.start();
    const output = await NodeService.runScript(cwd, script, abortController);
    consoleGroup.close();

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
    abortController,
  }: {
    targetPackage: NodePackage;
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

      const packageDistDirResponse = await NodeService.getPackageDistDir(
        dependency
      );
      if (packageDistDirResponse.error) {
        abortController?.abort();
        return {
          ...packageDistDirResponse,
          title: outputTitle,
        };
      }

      const dependencyDistDir = packageDistDirResponse.content ?? '';

      if (dependencyDistDir) {
        return await BuildService.injectSingleDependency({
          targetPackage,
          dependencyDistDir,
          dependencyName: dependency.packageName,
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
    dependencyDistDir,
    dependencyName,
    abortController,
  }: {
    targetPackage: NodePackage;
    dependencyDistDir: string;
    dependencyName: string;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse> {
    const outputTitle = `Dependency injection: ${dependencyName}`;

    if (abortController?.signal.aborted) {
      return {
        error: 'The process was aborted',
        title: outputTitle,
      };
    }

    const cleanDependencyDistDir = await WSLService.cleanSWLRoot(
      targetPackage.cwd ?? '',
      dependencyDistDir
    );

    const targetPackageDir = PathService.normalizeWin32Path(
      await WSLService.cleanSWLRoot(
        targetPackage.cwd ?? '',
        window.api.path.join(targetPackage.cwd ?? '', '/')
      )
    );

    const consoleGroup = new ConsoleGroup(
      `>>>----->> Injecting: ${dependencyName} -> ${
        targetPackage.packageName ?? ''
      }`,
      { abortController }
    );
    consoleGroup.start();

    const injectionOutput = await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('node_pi_inject_package.sh'),
        `"${NODE_PI_FILE_PREFIX}"`,
        `"${dependencyName}"`,
        `"${cleanDependencyDistDir}"`,
        `"${targetPackageDir}"`,
      ],
      cwd: targetPackage.cwd ?? '',
      traceOnTime: true,
      abortController,
    });

    consoleGroup.close();

    if (injectionOutput.error) {
      return {
        ...injectionOutput,
        title: outputTitle,
      };
    }

    return { title: outputTitle };
  }
}

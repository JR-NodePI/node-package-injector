import { NODE_PI_FILE_PREFIX } from '@renderer/constants';
import { promiseAllSequentially } from '@renderer/helpers/promisesHelpers';
import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageScript, { ScriptsType } from '@renderer/models/PackageScript';
import TerminalService from '@renderer/services/TerminalService';

import ConsoleGroup from '../ConsoleGroup';
import NodeService from '../NodeService/NodeService';
import { RelatedDependencyProjection } from '../NodeService/NodeServiceTypes';
import PathService from '../PathService';
import WSLService from '../WSLService';
import RunService, { type ProcessServiceResponse } from './RunService';

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export default class BuildService {
  public static async buildDependencies({
    abortController,
    additionalPackageScripts,
    packageManager,
    sortedRelatedDependencies,
  }: {
    abortController?: AbortController;
    additionalPackageScripts: PackageScript[];
    packageManager: PackageManager;
    sortedRelatedDependencies: RelatedDependencyProjection[];
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
          packageManager,
        })
    );

    const dependenciesResponses =
      promiseAllSequentially<ProcessServiceResponse[]>(dependenciesPromises);

    return dependenciesResponses;
  }

  private static async buildSingleDependency({
    abortController,
    additionalPackageScripts,
    packageManager,
    relatedDependency,
  }: {
    abortController?: AbortController;
    additionalPackageScripts: PackageScript[];
    packageManager: PackageManager;
    relatedDependency: RelatedDependencyProjection;
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
      packageManager,
    });

    if (RunService.hasError(injectDependenciesResponses)) {
      abortController?.abort();
      return injectDependenciesResponses;
    }

    // Run dependencies build scripts
    const scriptsResponses = await BuildService.runPackageScripts({
      abortController,
      additionalPackageScripts,
      nodePackage: dependency,
      packageManager,
      runScriptsTitle: 'Run dependency BUILD scripts',
      scriptsType: 'scripts',
    });

    if (RunService.hasError(scriptsResponses)) {
      abortController?.abort();
      return scriptsResponses;
    }

    return [...scriptsResponses, { title: outputTitle }];
  }

  public static async runPackageScripts({
    abortController,
    additionalPackageScripts,
    nodePackage,
    packageManager,
    runScriptsTitle = 'Run package scripts',
    scriptsType,
  }: {
    abortController?: AbortController;
    additionalPackageScripts: PackageScript[];
    nodePackage: NodePackage;
    packageManager: PackageManager;
    runScriptsTitle?: string;
    scriptsType: ScriptsType;
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

    const scripts = nodePackage[scriptsType];

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
          packageManager,
        })
    );

    const scriptsResponses =
      await promiseAllSequentially<ProcessServiceResponse>(scriptsPromises);

    return scriptsResponses;
  }

  private static async runPackageSingleScript({
    abortController,
    additionalPackageScripts,
    cwd,
    packageManager,
    packageName,
    packageScript,
  }: {
    abortController?: AbortController;
    additionalPackageScripts: PackageScript[];
    cwd: string;
    packageManager: PackageManager;
    packageName?: string;
    packageScript: PackageScript;
  }): Promise<ProcessServiceResponse> {
    const outputTitle = `Run package script: ${packageName} - ${packageScript.scriptName}`;

    if (abortController?.signal.aborted) {
      return {
        error: 'The process was aborted',
        title: outputTitle,
      };
    }

    let script = `${packageManager} run ${packageScript.scriptName}`;

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
    packageManager,
  }: {
    targetPackage: NodePackage;
    dependencies: DependencyPackage[];
    abortController?: AbortController;
    packageManager: PackageManager;
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
          packageManager,
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
    abortController,
    dependencyDistDir,
    dependencyName,
    packageManager,
    targetPackage,
  }: {
    abortController?: AbortController;
    dependencyDistDir: string;
    dependencyName: string;
    packageManager: PackageManager;
    targetPackage: NodePackage;
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
        `"${packageManager}"`,
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

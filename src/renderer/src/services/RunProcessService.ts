import { ADDITIONAL_PACKAGE_SCRIPTS } from '@renderer/appComponents/PackageBunchPage/PackageSelector/PackageScripts/PackageScriptsConstants';
import { promiseAllSequentially } from '@renderer/helpers/promisesHelpers';
import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageScript from '@renderer/models/PackageScript';
import GitService from '@renderer/services/GitService';
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

export class RunProcessService {
  public static async run({
    targetPackage,
    dependencies,
    abortController,
    isWSLActive,
  }: {
    targetPackage: NodePackage;
    dependencies: DependencyPackage[];
    abortController?: AbortController;
    isWSLActive?: boolean;
  }): Promise<ProcessServiceResponse[]> {
    if (targetPackage.cwd == null) {
      abortController?.abort();
      return [{ error: 'Package cwd is null', title: 'Invalid package' }];
    }

    const tmpDir = await PathService.getTmpDir({
      isWSLActive,
      skipWSLRoot: true,
      traceOnTime: true,
    });
    const cwd = targetPackage.cwd ?? '';
    const packageName = await NodeService.getPackageName(cwd);

    // package git pull
    const gitPullResponses = await RunProcessService.runGitPull({
      nodePackage: targetPackage,
      cwd,
      packageName,
    });
    if (hasError(gitPullResponses)) {
      return gitPullResponses;
    }

    // Run package scripts
    const scriptsResponses = await RunProcessService.runScripts({
      packageScripts: targetPackage.scripts,
      cwd,
      packageName,
      abortController,
    });
    if (hasError(scriptsResponses)) {
      abortController?.abort();
      return scriptsResponses;
    }

    // Run dependencies in build mode
    const dependenciesResponses = await RunProcessService.runBuildDependencies({
      dependencies,
      tmpDir,
      abortController,
    });
    if (hasError(dependenciesResponses.flat())) {
      abortController?.abort();
      return dependenciesResponses.flat();
    }

    // Inject dependencies
    const injectDependenciesResponses =
      await RunProcessService.injectDependencies({
        targetPackage,
        dependencies,
        packageName,
        tmpDir,
        abortController,
      });

    if (hasError(injectDependenciesResponses)) {
      abortController?.abort();
      return injectDependenciesResponses;
    }

    return [
      ...dependenciesResponses.flat(),
      { title: `Target: "${packageName}" success` },
    ];
  }

  private static async runGitPull({
    nodePackage,
    cwd,
    packageName,
  }: {
    nodePackage: NodePackage;
    cwd: string;
    packageName: string;
  }): Promise<ProcessServiceResponse[]> {
    if (nodePackage.performGitPull) {
      const output = await GitService.pull(cwd);

      if (output.error) {
        return [{ ...output, title: `Target: "${packageName}" git pull` }];
      }
    }

    return [];
  }

  private static async runBuildDependencies({
    dependencies,
    tmpDir,
    abortController,
  }: {
    dependencies: DependencyPackage[];
    tmpDir: string;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse[][]> {
    const sortedRelatedDependencies =
      await NodeService.getBuildModeDependenciesSortedByHierarchy(dependencies);

    const dependenciesPromises = sortedRelatedDependencies.map(
      relatedDependency => () =>
        RunProcessService.runBuildDependency({
          relatedDependency,
          tmpDir,
          abortController,
        })
    );

    const dependenciesResponses =
      promiseAllSequentially<ProcessServiceResponse[]>(dependenciesPromises);

    return dependenciesResponses;
  }

  private static async runBuildDependency({
    relatedDependency,
    tmpDir,
    abortController,
  }: {
    relatedDependency: RelatedDependencyProjection;
    tmpDir: string;
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse[]> {
    const { dependency } = relatedDependency;
    const depCwd = dependency.cwd ?? '';
    const depName = relatedDependency.dependencyName;

    if (abortController?.signal.aborted) {
      return Promise.resolve([
        {
          error: 'The process was aborted',
          title: `Dependency: "${depName}" aborted`,
        },
      ]);
    }

    // package git pull
    const gitPullResponses = await RunProcessService.runGitPull({
      nodePackage: dependency,
      cwd: depCwd,
      packageName: depName,
    });

    if (hasError(gitPullResponses)) {
      abortController?.abort();
      return gitPullResponses;
    }

    // Run dependencies scripts
    const scriptsResponses = await RunProcessService.runScripts({
      packageScripts: dependency.scripts,
      cwd: depCwd,
      packageName: depName,
      abortController,
    });

    if (hasError(scriptsResponses)) {
      abortController?.abort();
      return scriptsResponses;
    }

    // Inject dependencies
    const injectDependenciesResponses =
      await RunProcessService.injectDependencies({
        targetPackage: dependency,
        dependencies: relatedDependency.subDependencies,
        packageName: depName,
        tmpDir,
        abortController,
      });

    if (hasError(injectDependenciesResponses)) {
      abortController?.abort();
      return injectDependenciesResponses;
    }

    return [...scriptsResponses, { title: `Dependency: "${depName}" success` }];
  }

  private static async runScripts({
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
    const scriptsPromises = packageScripts
      .filter(script => Boolean(script.scriptName.trim()))
      .map(
        packageScript => () =>
          RunProcessService.runScript({
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

  private static async runScript({
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
    if (abortController?.signal.aborted) {
      return Promise.resolve({
        error: 'The process was aborted',
        title: `Script: "${packageScript.scriptName}" aborted`,
      });
    }

    let script = (await NodeService.checkYarn(cwd))
      ? `yarn ${packageScript.scriptName}`
      : (await NodeService.checkPnpm(cwd))
      ? `pnpm run ${packageScript.scriptName}`
      : `npm run ${packageScript.scriptName}`;

    if (ADDITIONAL_PACKAGE_SCRIPTS[packageScript.scriptName] != null) {
      script = ADDITIONAL_PACKAGE_SCRIPTS[packageScript.scriptName].scriptValue;
    }

    const output = await NodeService.runScript(cwd, script, abortController);

    if (output.error) {
      return {
        ...output,
        title: `Script: "${packageName}" ${packageScript.scriptName}`,
      };
    }

    return { title: `Script: "${packageName}" ${packageScript.scriptName}` };
  }

  private static async injectDependencies({
    targetPackage,
    packageName,
    dependencies,
    tmpDir,
    abortController,
  }: {
    targetPackage: NodePackage;
    packageName: string;
    tmpDir: string;
    dependencies: DependencyPackage[];
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse[]> {
    if (abortController?.signal.aborted) {
      return Promise.resolve([
        {
          error: 'The process was aborted',
          title: `Injection aborted`,
        },
      ]);
    }

    const injectPromises = dependencies.map(dependency => async () => {
      const dependencyPackagePath = await NodeService.getPackageBuildedPath(
        dependency.cwd ?? ''
      );

      const dependencyName = await NodeService.getPackageName(
        dependency.cwd ?? ''
      );

      if (dependencyPackagePath) {
        return await RunProcessService.injectDependencyPackage({
          targetPackage,
          dependencyPackagePath,
          dependencyName,
          tmpDir,
          abortController,
        });
      } else {
        return {
          error: 'The dependency package path does not exist',
          title: `Injection: "${dependencyName}"`,
        };
      }
    });

    const injectResponses =
      await promiseAllSequentially<ProcessServiceResponse>(injectPromises);

    if (hasError(injectResponses)) {
      abortController?.abort();
      return injectResponses;
    }

    return [...injectResponses, { title: `Injection: "${packageName}"` }];
  }

  private static async injectDependencyPackage({
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
    if (abortController?.signal.aborted) {
      return Promise.resolve({
        error: 'Aborted',
        title: `Injection aborted`,
      });
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

    const result = await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('inject_package.sh'),
        dependencyName,
        cleanDependencyPackagePath,
        tmpDependencyDir,
        targetPackageDir,
      ],
      cwd: targetPackage.cwd ?? '',
      traceOnTime,
      abortController,
    });

    return { ...result, title: `Injection success` };
  }
}

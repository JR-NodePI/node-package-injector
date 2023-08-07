import { ADDITIONAL_PACKAGE_SCRIPTS } from '@renderer/appComponents/PackageScripts/PackageScriptsConstants';
import { promiseAllSequentially } from '@renderer/helpers/promisesHelpers';
import DependencyPackage from '@renderer/models/DependencyPackage';
import { PackageScript } from '@renderer/models/PackageScriptsTypes';
import TargetPackage from '@renderer/models/TargetPackage';
import GitService from '@renderer/services/GitService';
import PathService from '@renderer/services/PathService';
import { type TerminalResponse } from '@renderer/services/TerminalService';

import NPMService from './NPMService';

type ProcessServiceResponse = TerminalResponse & { title: string };

export class ProcessService {
  public static async run(
    targetPackage: TargetPackage,
    dependencies: DependencyPackage[],
    abortController?: AbortController //TODO. Implement abortController to TerminalRepository
  ): Promise<ProcessServiceResponse[]> {
    if (targetPackage.cwd == null) {
      abortController?.abort();
      return [{ error: 'Package cwd is null', title: 'Invalid package' }];
    }

    const cwd = targetPackage.cwd ?? '';
    const pkgName = PathService.getPathDirectories(cwd).pop();

    // package git pull
    if (targetPackage.performGitPull) {
      const output = await GitService.pull(cwd);
      if (output.error) {
        return [{ ...output, title: `Target: "${pkgName}" git pull` }];
      }
    }

    const scriptsResponses = await promiseAllSequentially(
      targetPackage.scripts
        .filter(script => Boolean(script.scriptName.trim()))
        .map(
          script => () =>
            ProcessService.runScript(script, cwd, pkgName, abortController)
        )
    );

    const dependenciesResponses = await promiseAllSequentially(
      dependencies.map(
        dependency => () =>
          ProcessService.runDependency(dependency, abortController)
      )
    );

    return [
      ...scriptsResponses,
      ...dependenciesResponses.flat(),
      { title: `Target: "${pkgName}" success` },
    ];
  }

  private static async runScript(
    script: PackageScript,
    cwd: string,
    pkgName?: string,
    abortController?: AbortController
  ): Promise<ProcessServiceResponse> {
    const isYarn = await NPMService.checkYarn(cwd);

    let npmScript = isYarn
      ? `yarn ${script.scriptName}`
      : `npm run ${script.scriptName}`;

    if (ADDITIONAL_PACKAGE_SCRIPTS[script.scriptName] != null) {
      npmScript = ADDITIONAL_PACKAGE_SCRIPTS[script.scriptName].scriptValue;
    }

    const output = await NPMService.runScript(cwd, npmScript, abortController);

    if (output.error) {
      return {
        ...output,
        title: `Script: "${pkgName}" ${script.scriptName}`,
      };
    }

    return { title: `Script: "${pkgName}" ${script.scriptName}` };
  }

  private static async runDependency(
    dependency: DependencyPackage,
    abortController?: AbortController
  ): Promise<ProcessServiceResponse[]> {
    const depCwd = dependency.cwd ?? '';
    const depName = PathService.getPathDirectories(depCwd).pop();

    //TODO: execute each child-dependency before and, if it has npm package, try to inject in this one.

    // dependency git pull
    if (dependency.performGitPull) {
      const output = await GitService.pull(depCwd);
      if (output.error) {
        return [{ ...output, title: `Dependency: "${depName}" git pull` }];
      }
    }

    const scriptsResponses = await promiseAllSequentially(
      dependency.scripts
        .filter((script): boolean => Boolean(script.scriptName.trim()))
        .map(
          script => () =>
            ProcessService.runScript(script, depCwd, depName, abortController)
        )
    );

    //TODO: if an npm builded package exists, try to inject in targetPackage

    return [...scriptsResponses, { title: `Dependency: "${depName}" success` }];
  }
}

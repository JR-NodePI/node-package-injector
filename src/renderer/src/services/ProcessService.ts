import { ADDITIONAL_PACKAGE_SCRIPTS } from '@renderer/appComponents/PackageScripts/PackageScriptsConstants';
import { promiseAllSequentially } from '@renderer/helpers/promisesHelpers';
import DependencyPackage from '@renderer/models/DependencyPackage';
import { PackageScript } from '@renderer/models/PackageScriptsTypes';
import TargetPackage from '@renderer/models/TargetPackage';
import GitService from '@renderer/services/GitService';
import PathService from '@renderer/services/PathService';
import TerminalService, {
  TerminalResponse,
} from '@renderer/services/TerminalService';

type ProcessServiceResponse = TerminalResponse & { title: string };

export class ProcessService {
  public static async run(
    targetPackage: TargetPackage,
    dependencies: DependencyPackage[]
  ): Promise<ProcessServiceResponse[]> {
    if (targetPackage.cwd == null) {
      return [{ error: 'Package cwd is null', title: 'Invalid package' }];
    }

    const cwd = targetPackage.cwd ?? '';

    // package git pull
    if (targetPackage.performGitPull) {
      const output = await GitService.pull(cwd);
      if (output.error) {
        return [{ ...output, title: 'Package git pull' }];
      }
    }

    const scriptsResponses = await promiseAllSequentially(
      targetPackage.scripts
        .filter(script => Boolean(script.scriptName.trim()))
        .map(script => ProcessService.runScript(script, cwd))
    );

    const dependenciesResponses = await promiseAllSequentially(
      dependencies.map(ProcessService.runDependency)
    );

    return [
      { title: 'Package success' },
      ...scriptsResponses,
      ...dependenciesResponses,
    ];
  }

  private static async runScript(
    script: PackageScript,
    cwd: string
  ): Promise<TerminalResponse & { title: string }> {
    let commandOptions = {
      command: 'npm',
      args: ['run', script.scriptName],
      cwd,
      traceOnTime: true,
    };

    if (ADDITIONAL_PACKAGE_SCRIPTS[script.scriptName] != null) {
      const addScript = ADDITIONAL_PACKAGE_SCRIPTS[script.scriptName];
      const commandParts = addScript.scriptValue.split(' ');
      const command = commandParts.shift() ?? '';
      commandOptions = {
        command,
        args: commandParts,
        cwd,
        traceOnTime: true,
      };
    }

    const output = await TerminalService.executeCommand(commandOptions);

    if (output.error) {
      return { ...output, title: `Script "${script.scriptName}" error` };
    }

    return { title: `Script "${script.scriptName}" success` };
  }

  private static async runDependency(
    dependency: DependencyPackage
  ): Promise<TerminalResponse & { title: string }> {
    const depCwd = dependency.cwd ?? '';
    const depName = PathService.getPathDirectories(depCwd).pop();

    //TODO: execute each child-dependency before and, if it has npm package, try to inject in this one.

    // dependency git pull
    if (dependency.performGitPull) {
      const output = await GitService.pull(depCwd);
      if (output.error) {
        return { ...output, title: `Dependency "${depName}" git pull` };
      }
    }

    //TODO: execute scripts

    //TODO: if a npm package exists, try to inject in targetPackage

    return { title: `Dependency "${depName}" success` };
  }
}

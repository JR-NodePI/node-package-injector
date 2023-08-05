import DependencyPackage from '@renderer/models/DependencyPackage';
import TargetPackage from '@renderer/models/TargetPackage';
import GitService from '@renderer/services/GitService';
import PathService from '@renderer/services/PathService';
import { TerminalResponse } from '@renderer/services/TerminalService';

type ProcessServiceResponse = TerminalResponse & { title: string };

export class ProcessService {
  public static async run(
    targetPackage: TargetPackage,
    dependencies: DependencyPackage[]
  ): Promise<ProcessServiceResponse[]> {
    if (targetPackage.cwd == null) {
      return [{ error: 'Package cwd is null', title: 'Invalid package' }];
    }

    const swd = targetPackage.cwd ?? '';

    // package git pull
    if (targetPackage.performGitPull) {
      const output = await GitService.pull(swd);
      if (output.error) {
        return [{ ...output, title: 'Package git pull' }];
      }
    }

    //TODO: execute scripts

    const dependenciesResponses = await Promise.all(
      dependencies.map(ProcessService.runDependency)
    );

    return [{ title: 'Package success' }, ...dependenciesResponses];
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

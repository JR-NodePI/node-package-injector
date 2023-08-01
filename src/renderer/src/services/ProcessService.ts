import DependencyPackage from '@renderer/models/DependencyPackage';
import TargetPackage from '@renderer/models/TargetPackage';
import GitService from '@renderer/services/GitService';
import NPMService from '@renderer/services/NPMService';
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

    // package yarn install
    if (targetPackage.installMode) {
      const output = await NPMService.install(swd, targetPackage.installMode);
      if (output.error) {
        return [{ ...output, title: 'Package install' }];
      }
    }

    const promises = dependencies.map(
      async (dependency): Promise<TerminalResponse & { title: string }> => {
        const depCwd = dependency.cwd ?? '';
        const depName = PathService.getPathDirectories(depCwd).pop();

        // dependency pull
        if (dependency.performGitPull) {
          const output = await GitService.pull(depCwd);
          if (output.error) {
            return { ...output, title: `Dependency "${depName}" git pull` };
          }
        }

        // dependency install
        if (dependency.installMode) {
          const output = await NPMService.install(
            depCwd,
            dependency.installMode
          );
          if (output.error) {
            return { ...output, title: `Dependency "${depName}" install` };
          }
        }

        //         // dependency yarn dist
        //         if (dependency.mode === DependencyMode.BUILD) {
        //           await NPMService.getBuildScripts(depCwd);
        //
        //           const output = await NPMService.yarnDist(depCwd);
        //           if (output.error) {
        //             return { ...output, title: `Dependency "${depName}" yarn dist` };
        //           }
        //         }

        return { title: `Dependency "${depName}" success` };
      }
    );

    const results = await Promise.all(promises);

    return [{ title: 'Package success' }, ...results];
  }
}

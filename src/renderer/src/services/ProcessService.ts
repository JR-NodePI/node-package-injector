import { DependencyMode } from '@renderer/models/DependencyConstants';
import DependencyPackage from '@renderer/models/DependencyPackage';
import TargetPackage from '@renderer/models/TargetPackage';
import GitService from '@renderer/services/GitService';
import NPMService from '@renderer/services/NPMService';
import PathService from '@renderer/services/PathService';
import { TerminalResponse } from '@renderer/services/TerminalService';

type Resp = TerminalResponse & { title: string };

export class ProcessService {
  public static async run(
    targetPackage: TargetPackage,
    dependencies: DependencyPackage[]
  ): Promise<Resp[]> {
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
    if (targetPackage.performInstallMode) {
      const output = await NPMService.install(swd);
      if (output.error) {
        return [{ ...output, title: 'Package yarn install' }];
      }
    }

    const promises = dependencies.map(
      async (dependency): Promise<TerminalResponse & { title: string }> => {
        const depCwd = dependency.cwd ?? '';
        const depName = PathService.getPathDirectories(depCwd).pop();

        // dependency git pull
        if (dependency.performGitPull) {
          const output = await GitService.pull(depCwd);
          if (output.error) {
            return { ...output, title: `Dependency "${depName}" git pull` };
          }
        }

        // dependency yarn install
        if (dependency.performInstallMode) {
          const output = await NPMService.install(depCwd);
          if (output.error) {
            return { ...output, title: `Dependency "${depName}" yarn install` };
          }
        }

        // dependency yarn dist
        if (dependency.mode === DependencyMode.BUILD) {
          await NPMService.getBuildScripts(depCwd);

          const output = await NPMService.yarnDist(depCwd);
          if (output.error) {
            return { ...output, title: `Dependency "${depName}" yarn dist` };
          }
        }

        return { title: `Dependency "${depName}" success` };
      }
    );

    const results = await Promise.all(promises);

    return [{ title: 'Package success' }, ...results];
  }
}

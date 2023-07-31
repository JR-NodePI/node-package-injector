import DependencyConfig from '@renderer/models/DependencyConfig';
import { DependencyMode } from '@renderer/models/DependencyConfigConstants';
import PackageConfig from '@renderer/models/PackageConfig';
import GitService from '@renderer/services/GitService';
import NPMService from '@renderer/services/NPMService';
import PathService from '@renderer/services/PathService';
import { TerminalResponse } from '@renderer/services/TerminalService';

type Resp = TerminalResponse & { title: string };

export class ProcessService {
  public static async run(
    packageConfig: PackageConfig,
    dependencies: DependencyConfig[]
  ): Promise<Resp[]> {
    if (packageConfig.cwd == null) {
      return [{ error: 'Package cwd is null', title: 'Invalid package' }];
    }

    const swd = packageConfig.cwd ?? '';

    // package git pull
    if (packageConfig.performGitPull) {
      const output = await GitService.pull(swd);
      if (output.error) {
        return [{ ...output, title: 'Package git pull' }];
      }
    }

    // package yarn install
    if (packageConfig.performYarnInstall) {
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
        if (dependency.performYarnInstall) {
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

        return { content: 'success', title: `Dependency "${depName}" success` };
      }
    );

    const results = await Promise.all(promises);

    return [{ content: 'success', title: 'Package success' }, ...results];
  }
}

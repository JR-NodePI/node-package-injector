import DependencyConfig from '@renderer/models/DependencyConfig';
import PackageConfig from '@renderer/models/PackageConfig';
import TerminalService, {
  TerminalResponse,
} from '@renderer/services/TerminalService';

export class ProcessService {
  public static async run(
    packageConfig: PackageConfig,
    dependencies: DependencyConfig[]
  ): Promise<boolean> {
    return false;
    if (packageConfig.cwd == null) {
      return false;
    }

    // package git pull
    if (packageConfig.performGitPull) {
      try {
        await TerminalService.executeCommand({
          command: 'git',
          args: ['pull'],
          cwd: packageConfig.cwd,
        });
      } catch {
        return false;
      }
    }

    // package yarn install
    if (packageConfig.performYarnInstall) {
      try {
        await TerminalService.executeCommand({
          command: 'yarn',
          args: ['install', '--pure-lock'],
          cwd: packageConfig.cwd,
        });
      } catch {
        return false;
      }
    }

    return true;
  }
}

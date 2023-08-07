import type DependencyPackage from '@renderer/models/DependencyPackage';

import PathService from './PathService';
import TerminalService, { TerminalResponse } from './TerminalService';

export default class NPMService {
  private static async getDependenciesNames(cwd?: string): Promise<string[]> {
    try {
      const fileContent = await window.api.fs.readFile(
        window.api.path.join(cwd ?? '', 'package.json'),
        'utf8'
      );

      const json = JSON.parse(fileContent);

      return [
        ...Object.keys(json?.dependencies ?? {}),
        ...Object.keys(json?.devDependencies ?? {}),
        ...Object.keys(json?.peerDependencies ?? {}),
      ];
    } catch (error) {
      return [];
    }
  }

  private static getDependencyIdsByNames(
    dependencies: DependencyPackage[],
    names: string[]
  ): string[] {
    return dependencies
      .filter(({ cwd }) => {
        const pathDirectories = PathService.getPathDirectories(cwd);
        const name = pathDirectories.pop();
        return names.some(npmDependency => npmDependency === name);
      })
      .map(({ id: uuid }) => uuid);
  }

  private static async getNodeVersions(): Promise<Record<string, string>> {
    const output = await TerminalService.executeCommand({
      command: 'bash',
      args: [PathService.getExtraResourcesScriptPath('check_node.sh')],
      cwd: window.api.path.join(window.api.extraResourcesPath),
      skipWSL: true,
    });

    try {
      const data = JSON.parse(output?.content ?? '');
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    return {};
  }

  public static async checkNodeNpmYarn(): Promise<boolean> {
    const data = await NPMService.getNodeVersions();
    return data?.node != null && data?.npm != null && data?.yarn != null;
  }

  public static async checkPackageJSON(cwd: string): Promise<boolean> {
    try {
      await window.api.fs.access(
        window.api.path.join(cwd, 'package.json'),
        window.api.fs.constants.F_OK
      );
    } catch (error) {
      return false;
    }

    return true;
  }

  public static async getDependenciesWithRelatedDependencyIds(
    dependencies: DependencyPackage[]
  ): Promise<DependencyPackage[]> {
    const promises = dependencies.map(async depConf => {
      const npmDepNames = await NPMService.getDependenciesNames(depConf.cwd);

      const newDependency = depConf.clone();
      newDependency.relatedDependencyConfigIds =
        NPMService.getDependencyIdsByNames(dependencies, npmDepNames);
      return newDependency;
    });

    return await Promise.all(promises);
  }

  public static async checkYarn(cwd: string): Promise<boolean> {
    try {
      await window.api.fs.access(
        window.api.path.join(cwd, 'yarn.lock'),
        window.api.fs.constants.F_OK
      );
    } catch (error) {
      return false;
    }

    return true;
  }

  public static async getPackageScripts(
    cwd: string
  ): Promise<Record<string, string>> {
    const output = await TerminalService.executeCommand({
      command: 'bash',
      args: [PathService.getExtraResourcesScriptPath('npm_get_scripts.sh')],
      cwd,
    });

    try {
      return JSON.parse(output.content ?? '{}');
    } catch (error) {
      return {};
    }
  }

  public static async runScript(
    cwd: string,
    script: string
  ): Promise<TerminalResponse> {
    return await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('npm_run_script.sh'),
        `--npm_command`,
        `${JSON.stringify(script)}`,
      ],
      cwd,
      traceOnTime: true,
    });
  }
}

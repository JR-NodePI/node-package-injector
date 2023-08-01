import type DependencyConfig from '@renderer/models/DependencyConfig';

import PathService from './PathService';
import TerminalService, { TerminalResponse } from './TerminalService';

export default class NPMService {
  private static async getDependenciesNamesFromPackageJSON(
    cwd?: string
  ): Promise<string[]> {
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

  private static getDependencyConfigIdsByNames(
    dependencyConfigs: DependencyConfig[],
    names: string[]
  ): string[] {
    return dependencyConfigs
      .filter(({ cwd }) => {
        const pathDirectories = PathService.getPathDirectories(cwd);
        const name = pathDirectories.pop();
        return names.some(npmDependency => npmDependency === name);
      })
      .map(({ id: uuid }) => uuid);
  }

  private static async getNodeNpmYarnVersions(): Promise<{
    [key: string]: string;
  }> {
    const output = await TerminalService.executeCommand({
      command: 'bash',
      args: [window.api.path.join('.', '/', 'check_node.sh')],
      cwd: window.api.path.join(window.api.extraResourcesPath),
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
    const data = await NPMService.getNodeNpmYarnVersions();
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

  public static async getDependencyConfigsWithRelatedDependencyIds(
    dependencyConfigs: DependencyConfig[]
  ): Promise<DependencyConfig[]> {
    const promises = dependencyConfigs.map(async depConf => {
      const npmDepNames = await NPMService.getDependenciesNamesFromPackageJSON(
        depConf.cwd
      );

      const newDependency = depConf.clone();
      newDependency.relatedDependencyConfigIds =
        NPMService.getDependencyConfigIdsByNames(
          dependencyConfigs,
          npmDepNames
        );
      return newDependency;
    });

    return await Promise.all(promises);
  }

  static async install(cwd: string): Promise<TerminalResponse> {
    //TODO: check is yarn or npm
    return await TerminalService.executeCommand({
      command: 'yarn',
      args: ['install', '--pure-lock'],
      cwd,
    });
  }

  static async yarnDist(cwd: string): Promise<TerminalResponse> {
    return await TerminalService.executeCommand({
      command: 'yarn',
      args: ['dist'],
      cwd,
    });
  }

  static async checkYarn(cwd: string): Promise<boolean> {
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

  static async checkNPM(cwd: string): Promise<boolean> {
    try {
      await window.api.fs.access(
        window.api.path.join(cwd, 'package-lock.json'),
        window.api.fs.constants.F_OK
      );
    } catch (error) {
      return false;
    }

    return true;
  }

  static async getBuildScripts(cwd: string): Promise<string> {
    const output = await TerminalService.executeCommand({
      command: 'npm',
      args: ['pkg', 'get', 'scripts'],
      cwd,
    });

    let scripts: { [key: string]: string };
    try {
      scripts = JSON.parse(output.content ?? '{}');
    } catch (error) {
      scripts = {};
    }

    // TODO: determine the script if contains "pack" or "dist"
    if (scripts.dist) {
      return scripts.dist;
    }

    if (scripts.compile) {
      return scripts.compile;
    }

    return '';
  }
}

import type DependencyPackage from '@renderer/models/DependencyPackage';
import {
  PackageInstallMode,
  PackageInstallModeValue,
} from '@renderer/models/PackageInstallMode';

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
    dependencys: DependencyPackage[],
    names: string[]
  ): string[] {
    return dependencys
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
    dependencys: DependencyPackage[]
  ): Promise<DependencyPackage[]> {
    const promises = dependencys.map(async depConf => {
      const npmDepNames = await NPMService.getDependenciesNames(depConf.cwd);

      const newDependency = depConf.clone();
      newDependency.relatedDependencyConfigIds =
        NPMService.getDependencyIdsByNames(dependencys, npmDepNames);
      return newDependency;
    });

    return await Promise.all(promises);
  }

  static async install(
    cwd: string,
    mode: PackageInstallModeValue
  ): Promise<TerminalResponse> {
    if (mode === PackageInstallMode.YARN) {
      return await TerminalService.executeCommand({
        command: 'yarn',
        args: ['install', '--pure-lock'],
        cwd,
      });
    }

    return await TerminalService.executeCommand({
      command: 'npm',
      args: ['install', '--pure-lockfile'],
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

  static async getPackageScripts(cwd: string): Promise<Record<string, string>> {
    const output = await TerminalService.executeCommand({
      command: 'npm',
      args: ['pkg', 'get', 'scripts'],
      cwd,
    });

    try {
      return JSON.parse(output.content ?? '{}');
    } catch (error) {
      return {};
    }
  }
}

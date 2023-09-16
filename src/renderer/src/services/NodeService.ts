import type DependencyPackage from '@renderer/models/DependencyPackage';

import PathService from './PathService';
import TerminalService, { TerminalResponse } from './TerminalService';

export default class NodeService {
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

  private static async hasFile(
    cwd: string,
    fileName: string
  ): Promise<boolean> {
    try {
      await window.api.fs.access(
        window.api.path.join(cwd, fileName),
        window.api.fs.constants.F_OK
      );
    } catch (error) {
      return false;
    }

    return true;
  }

  public static async getNodeVersions(): Promise<Record<string, string>> {
    const output = await TerminalService.executeCommand({
      command: 'bash',
      args: [PathService.getExtraResourcesScriptPath('check_node.sh')],
      cwd: window.api.path.join(window.api.extraResourcesPath),
      skipWSL: true,
      ignoreStderrErrors: true,
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

  public static async checkPackageJSON(cwd: string): Promise<boolean> {
    return NodeService.hasFile(cwd, 'package.json');
  }

  public static async getDependenciesRelations(
    dependencies: DependencyPackage[]
  ): Promise<Record<string, string[]>> {
    const promises = dependencies.map(async depConf => {
      const npmDepNames = await NodeService.getDependenciesNames(depConf.cwd);
      return NodeService.getDependencyIdsByNames(dependencies, npmDepNames);
    });
    const entries = await Promise.all(promises);
    return Object.fromEntries(entries);
  }

  public static async checkYarn(cwd: string): Promise<boolean> {
    return NodeService.hasFile(cwd, 'yarn.lock');
  }

  public static async checkViteConfig(cwd: string): Promise<boolean> {
    return NodeService.hasFile(cwd, 'pnpm-lock.yaml');
  }

  public static async checkCracoConfig(cwd: string): Promise<boolean> {
    return NodeService.hasFile(cwd, 'craco.config.json');
  }

  public static async checkIsSynchronizable(cwd: string): Promise<boolean> {
    return (
      (await NodeService.checkViteConfig(cwd)) ||
      (await NodeService.checkCracoConfig(cwd))
    );
  }

  public static async checkPnpm(cwd: string): Promise<boolean> {
    return NodeService.hasFile(cwd, 'pnpm-lock.yaml');
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
    script: string,
    abortController?: AbortController
  ): Promise<TerminalResponse> {
    return await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('npm_run_script.sh'),
        `${JSON.stringify(script)}`,
      ],
      cwd,
      traceOnTime: true,
      abortController,
    });
  }
}

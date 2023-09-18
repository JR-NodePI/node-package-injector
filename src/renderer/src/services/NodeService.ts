import type DependencyPackage from '@renderer/models/DependencyPackage';

import getDependenciesSortedByHierarchy from './getDependenciesSortedByHierarchy';
import PathService from './PathService';
import TerminalService, { TerminalResponse } from './TerminalService';

export default class NodeService {
  private static async getPackageJson(
    cwd?: string
  ): Promise<Record<string, string | Record<string, string>> | null> {
    try {
      const fileContent = await window.api.fs.readFile(
        window.api.path.join(cwd ?? '', 'package.json'),
        'utf8'
      );
      return JSON.parse(fileContent);
    } catch (error) {
      return null;
    }
  }

  public static async getDependenciesNames(cwd?: string): Promise<string[]> {
    const packageJson = await NodeService.getPackageJson(cwd);
    if (packageJson != null) {
      return [
        ...Object.keys(packageJson?.dependencies ?? {}),
        ...Object.keys(packageJson?.devDependencies ?? {}),
        ...Object.keys(packageJson?.peerDependencies ?? {}),
      ];
    }
    return [];
  }

  public static async getPackageName(cwd?: string): Promise<string | null> {
    const packageJson = await NodeService.getPackageJson(cwd);
    if (packageJson != null) {
      return (packageJson?.name as string) ?? null;
    }
    return null;
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

  public static async getDependenciesSortedByHierarchy(
    dependencies: DependencyPackage[]
  ): Promise<Array<[string, string[]]>> {
    return await getDependenciesSortedByHierarchy(dependencies);
  }

  public static async checkYarn(cwd: string): Promise<boolean> {
    return NodeService.hasFile(cwd, 'yarn.lock');
  }

  public static async checkViteConfig(cwd: string): Promise<boolean> {
    return NodeService.hasFile(cwd, 'vite.config.js');
  }

  public static async checkCracoConfig(cwd: string): Promise<boolean> {
    return NodeService.hasFile(cwd, 'craco.config.js');
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

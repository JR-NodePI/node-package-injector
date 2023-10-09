import type DependencyPackage from '@renderer/models/DependencyPackage';

import PathService from '../PathService';
import TerminalService, { type TerminalResponse } from '../TerminalService';
import getDependenciesSortedByHierarchy from './getBuildModeDependenciesSortedByHierarchy';
import { RelatedDependencyProjection } from './NodeServiceTypes';

type PackageJsonStructure = string | Record<string, string>;

export default class NodeService {
  private static async getPackageJson(
    cwd: string
  ): Promise<Record<string, PackageJsonStructure> | null> {
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

  private static async getPackageJsonDataItem(
    cwd: string,
    itemKey: string
  ): Promise<PackageJsonStructure | null> {
    const packageJson = await NodeService.getPackageJson(cwd);

    if (packageJson != null) {
      return (packageJson?.[itemKey] as PackageJsonStructure) ?? null;
    }

    return null;
  }

  private static async hasFile(
    cwd: string,
    ...fileName: string[]
  ): Promise<boolean> {
    try {
      await window.api.fs.access(
        window.api.path.join(cwd, ...fileName),
        window.api.fs.constants.F_OK
      );
    } catch (error) {
      return false;
    }

    return true;
  }

  private static async hasFilesByRegexp(
    cwd: string,
    filePattern: RegExp
  ): Promise<boolean> {
    try {
      const files = await window.api.fs.readdir(cwd, {
        withFileTypes: true,
      });
      const matchingFiles = files.filter(file => {
        return file.isFile() && file.name.match(filePattern);
      });
      return matchingFiles.length > 0;
    } catch (error) {
      return false;
    }
  }

  public static async getDependenciesNames(cwd: string): Promise<string[]> {
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

  public static async getPackageName(cwd: string): Promise<string> {
    return ((await NodeService.getPackageJsonDataItem(cwd, 'name')) ??
      '') as string;
  }

  public static async getPackageVersion(cwd: string): Promise<string> {
    return ((await NodeService.getPackageJsonDataItem(cwd, 'version')) ??
      '') as string;
  }

  public static async getPackageScripts(
    cwd: string
  ): Promise<Record<string, string>> {
    const packageJson = await NodeService.getPackageJson(cwd);
    if (packageJson != null) {
      return (packageJson?.scripts ?? {}) as Record<string, string>;
    }
    return {};
  }

  public static async getPackageBuildedPath(
    cwd: string
  ): Promise<TerminalResponse> {
    const packageName = await NodeService.getPackageName(cwd);

    if (!packageName) {
      return { error: 'There is no package name' };
    }

    const fileName = `${packageName}-v${NodeService.FAKE_PACKAGE_VERSION}.tgz`;

    for (const dir of ['', 'dist', '.dist', 'build', '.build', 'out', '.out']) {
      if (await NodeService.hasFile(cwd, dir, fileName)) {
        const builtPackagePath = window.api.path.join(cwd, dir, fileName);
        return { content: builtPackagePath };
      }
    }

    return { error: `There is no built package for ${packageName}` };
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
  ): Promise<Array<RelatedDependencyProjection>> {
    return await getDependenciesSortedByHierarchy(dependencies);
  }

  public static async checkYarn(cwd: string): Promise<boolean> {
    return NodeService.hasFile(cwd, 'yarn.lock');
  }

  public static async checkViteConfig(cwd: string): Promise<boolean> {
    return NodeService.hasFilesByRegexp(
      cwd,
      new RegExp('.*vite\\.config\\.(js|ts)$')
    );
  }

  public static async checkCracoConfig(cwd: string): Promise<boolean> {
    return NodeService.hasFilesByRegexp(
      cwd,
      new RegExp('.*craco\\.config\\.(js|ts)$')
    );
  }

  public static async checkIsSynchronizable(cwd: string): Promise<boolean> {
    return (
      (await NodeService.checkViteConfig(cwd)) ||
      (await NodeService.checkCracoConfig(cwd))
    );
  }

  public static async checkBuildedDist(cwd: string): Promise<boolean> {
    //redpoints-front-testing-v0.0.1.tgz
    return NodeService.hasFile(window.api.path.join(cwd, '/'), 'yarn.lock');
  }

  public static async checkPnpm(cwd: string): Promise<boolean> {
    return NodeService.hasFile(cwd, 'pnpm-lock.yaml');
  }

  public static async writeFile(cwd: string, content: string): Promise<void> {
    return window.api.fs.writeFile(cwd, content, 'utf8');
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

  public static readonly FAKE_PACKAGE_VERSION = '6.6.6-node-pi';

  public static async injectFakePackageVersion(
    cwd: string,
    abortController?: AbortController
  ): Promise<TerminalResponse> {
    return await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('inject_fake_pkg_version.sh'),
        NodeService.FAKE_PACKAGE_VERSION,
      ],
      cwd,
      traceOnTime: true,
      abortController,
    });
  }

  public static async restoreFakePackageVersion(
    cwd: string,
    abortController?: AbortController
  ): Promise<TerminalResponse> {
    return await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('restore_fake_pkg_version.sh'),
      ],
      cwd,
      traceOnTime: true,
      abortController,
    });
  }
}

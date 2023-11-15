import { NODE_PI_FILE_PREFIX } from '@renderer/constants';
import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';

import PathService from '../PathService';
import type { TerminalResponse } from '../TerminalService';
import TerminalService from '../TerminalService';
import WSLService from '../WSLService';
export type ProcessServiceResponse = TerminalResponse & { title: string };

export default class RunService {
  public static hasError(responses: ProcessServiceResponse[]): boolean {
    return responses.some(response => Boolean(response.error));
  }

  public static async resetAll({
    targetPackage,
    dependencies,
    abortController,
  }: {
    targetPackage: NodePackage;
    dependencies: DependencyPackage[];
    abortController?: AbortController;
  }): Promise<ProcessServiceResponse> {
    const outputTitle = 'Reset all';
    if (abortController?.signal.aborted) {
      return {
        error: 'The process was aborted',
        title: outputTitle,
      };
    }

    const cwd = targetPackage.cwd ?? '';

    const targetPackageCwd = await WSLService.cleanSWLRoot(cwd, cwd);

    const dependenciesCWDs = await Promise.all(
      dependencies.map(
        async dep =>
          await WSLService.cleanSWLRoot(dep.cwd ?? '', `"${dep.cwd ?? ''}"`)
      )
    );

    const resetResponse = await TerminalService.executeCommand({
      command: 'bash',
      args: [
        PathService.getExtraResourcesScriptPath('node_pi_reset_all.sh'),
        `"${NODE_PI_FILE_PREFIX}"`,
        `"${targetPackageCwd}"`,
        ...dependenciesCWDs,
      ],
      cwd,
      abortController,
      skipWSL: true,
    });

    return { ...resetResponse, title: outputTitle };
  }
}

import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';

import NodeService from '../NodeService/NodeService';
import PathService from '../PathService';
import TerminalService from '../TerminalService';
import { type ProcessServiceResponse } from './RunService';

export default class SyncService {
  public static async prepareSync({
    targetPackage,
    dependencies,
    abortController,
    isWSLActive,
  }: {
    targetPackage: NodePackage;
    dependencies: DependencyPackage[];
    abortController?: AbortController;
    isWSLActive?: boolean;
  }): Promise<ProcessServiceResponse[]> {
    const syncTitle = 'Creating package.json for monorepo sync';

    if (abortController?.signal.aborted) {
      return [
        {
          error: 'The process was aborted',
          title: syncTitle,
        },
      ];
    }

    const allPaths = [
      ...dependencies.map(({ cwd }) => cwd ?? ''),
      targetPackage.cwd ?? '',
    ];

    const monoCwd = allPaths.reduce((shorterCwd, cwd) => {
      const prevPath = PathService.getPreviousPath(cwd);
      const isShorterPath =
        prevPath.split(PathService.splitPattern).length <
        shorterCwd.split(PathService.splitPattern).length;
      if (!shorterCwd || isShorterPath) {
        return prevPath;
      }
      return shorterCwd;
    }, '');

    const workspaces = allPaths.map(path =>
      window.api.path.join(
        ...path.replace(monoCwd, '').split(PathService.splitPattern)
      )
    );

    const packageJsonContent = {
      name: 'node-package-injector-monorepo-sync',
      version: NodeService.FAKE_PACKAGE_VERSION,
      private: true,
      scripts: {
        'install-mono':
          'npm install --force --no-save --no-fund --no-package-lock --no-update-notifier -s',
      },
      workspaces,
    };

    const cwd = await PathService.getPath(
      window.api.path.join(monoCwd),
      isWSLActive
    );
    const packagePath = await PathService.getPath(
      window.api.path.join(monoCwd, '/package.json'),
      isWSLActive
    );

    // TODO: trow error if package.json already exist

    await NodeService.writeFile(
      packagePath,
      JSON.stringify(packageJsonContent, null, 2)
    );

    const response = await NodeService.runScript(
      cwd,
      'echo "hola"',
      abortController
    );

    // const response = await TerminalService.executeCommand({
    //   command: 'bash',
    //   args: [
    //     PathService.getExtraResourcesScriptPath('npm_run_script.sh'),
    //     `${JSON.stringify('echo "hola"  ')}`,
    //   ],
    //   cwd: window.api.path.join(monoCwd),
    //   traceOnTime: true,
    //   skipWSL: true,
    //   abortController,
    // });

    return [{ ...response, title: syncTitle }];
  }
}

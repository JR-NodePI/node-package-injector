import TerminalService from './TerminalService';

export default class NodeService {
  static async getNodeNpmYarnVersions(): Promise<{ [key: string]: string }> {
    const output = await TerminalService.executeCommand({
      command: 'bash',
      args: [window.api.path.join('.', '/', 'check_node.sh')],
      cwd: window.api.path.join(window.api.extraResourcesPath),
    });

    try {
      const data = JSON.parse(output);
      return data;
    } catch (error) {
      console.error(error);
    }

    return {};
  }

  static async checkNodeNpmYarn(): Promise<boolean> {
    const data = await NodeService.getNodeNpmYarnVersions();
    return data?.node != null && data?.npm != null && data?.yarn != null;
  }

  static async checkPackageJSON(cwd: string): Promise<boolean> {
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
}

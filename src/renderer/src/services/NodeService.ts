export default class NodeService {
  static async getNodeNpmYarnVersions(): Promise<{ [key: string]: string }> {
    const cwd = window.electron.process.env.HOME ?? '';

    const output = await window.api.executeCommand({
      command: 'bash',
      args: [window.api.path.join(window.api.extraResourcesPath, 'check_node.sh')],
      cwd,
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

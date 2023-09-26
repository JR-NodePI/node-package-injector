const TerminalService = window.api.TerminalService;

export type ExecuteCommandOptions = Parameters<
  typeof TerminalService.executeCommand
>[0];

export type TerminalResponse = Awaited<
  ReturnType<typeof TerminalService.executeCommand>
>;

export default TerminalService;

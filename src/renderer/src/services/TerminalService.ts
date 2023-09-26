const TerminalService = window.api.TerminalService;

export type TerminalResponse = Awaited<
  ReturnType<typeof TerminalService.executeCommand>
>;

export default TerminalService;

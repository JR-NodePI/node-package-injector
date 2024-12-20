export default class ConsoleGroup {
  private label: string;
  private collapsed: boolean;
  private isStarted = false;

  constructor(
    label?: string,
    {
      collapsed = true,
      abortController,
    }: {
      collapsed?: boolean;
      abortController?: AbortController;
    } = { collapsed: true }
  ) {
    this.label = label ?? '';
    this.collapsed = !!collapsed;

    if (abortController) {
      abortController.signal.addEventListener('abort', () => {
        this.close();
      });
    }
  }

  start(): void {
    if (this.collapsed) {
      // eslint-disable-next-line no-console
      console.groupCollapsed(this.label);
    } else {
      // eslint-disable-next-line no-console
      console.group(this.label);
    }

    this.isStarted = true;
  }

  close(): void {
    if (this.isStarted) {
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }
}

import type { TerminalResponse } from '../TerminalService';
export type ProcessServiceResponse = TerminalResponse & { title: string };

export default class RunService {
  public static hasError(responses: ProcessServiceResponse[]): boolean {
    return responses.some(response => Boolean(response.error));
  }
}

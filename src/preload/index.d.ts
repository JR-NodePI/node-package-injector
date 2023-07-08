import { type ElectronAPI } from '@electron-toolkit/preload';
import type path from 'node:path';
import type fs from 'fs/promises';
import type TerminalService from '../preload/Terminal/TerminalService';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      fs: typeof fs;
      path: typeof path;
      executeCommand: typeof TerminalService.executeCommand;
      extraResourcesPath: string;
    };
  }
}

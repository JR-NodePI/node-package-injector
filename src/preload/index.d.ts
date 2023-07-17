import { type ElectronAPI } from '@electron-toolkit/preload';
import type fs from 'fs/promises';
import type os from 'os';
import type path from 'node:path';
import type TerminalService from '../preload/Terminal/TerminalService';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      extraResourcesPath: string;
      fs: typeof fs;
      os: typeof os;
      path: typeof path;
      TerminalService: typeof TerminalService;
    };
  }
}

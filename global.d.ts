import { type ElectronAPI } from '@electron-toolkit/preload';
import type fs from 'node:fs/promises';
import type os from 'node:os';
import type path from 'node:path';

import type PathService from './src/preload/Path/PathService';
import type ConsoleGroup from './src/preload/Terminal/ConsoleGroup';
import type TerminalService from './src/preload/Terminal/TerminalService';
import type WSLService from './src/preload/WSL/WSLService';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      extraResourcesPath: string;
      fs: typeof fs;
      isDevMode: boolean;
      os: typeof os;
      path: typeof path;
      ConsoleGroup: typeof ConsoleGroup;
      PathService: typeof PathService;
      TerminalService: typeof TerminalService;
      WSLService: typeof WSLService;
    };
  }

  interface Array<T> {
    toSorted(compareFn?: (a: T, b: T) => number): T[];
  }

  interface Array<T> {
    toSpliced(start: number, deleteCount: number, ...items: T[]): T[];
  }
}

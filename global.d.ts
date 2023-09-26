import { type ElectronAPI } from '@electron-toolkit/preload';
import type fs from 'node:fs/promises';
import type os from 'node:os';
import type path from 'node:path';

import type TerminalService from './src/preload/Terminal/TerminalService';

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

interface Array<T> {
  toSorted(compareFn?: (a: T, b: T) => number): T[];
}

interface Array<T> {
  toSpliced(start: number, deleteCount: number, ...items: T[]): T[];
}

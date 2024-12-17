import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge } from 'electron';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { extraResourcesPath, isDevMode } from './constants';
import PathService from './Path/PathService';
import ConsoleGroup from './Terminal/ConsoleGroup';
import TerminalService from './Terminal/TerminalService';
import WSLService from './WSL/WSLService';

// Custom APIs for renderer
const api = {
  extraResourcesPath,
  fs,
  isDevMode,
  os,
  path,
  PathService,
  ConsoleGroup,
  TerminalService,
  WSLService,
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}

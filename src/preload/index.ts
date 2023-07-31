import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge } from 'electron';
import fs from 'fs/promises';
import path from 'node:path';
import os from 'os';

import TerminalService from './Terminal/TerminalService';

const isDev = process.env.NODE_ENV === 'development';
const PACKAGE_VERSION = import.meta.env.PACKAGE_VERSION;

// Custom APIs for renderer
const api = {
  extraResourcesPath: isDev
    ? path.join(__dirname, '../../', 'extraResources')
    : path.join(process.resourcesPath ?? '', 'extraResources'),
  fs,
  os,
  path,
  TerminalService,
  PACKAGE_VERSION,
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

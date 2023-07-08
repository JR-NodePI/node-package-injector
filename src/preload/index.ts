import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import path from 'node:path';
import fs from 'fs/promises';
import TerminalService from './Terminal/TerminalService';

const isDev = process.env.NODE_ENV === 'development';

// Custom APIs for renderer
const api = {
  path,
  fs,
  executeCommand: TerminalService.executeCommand,
  extraResourcesPath: isDev
    ? path.join(electronAPI.process.env.PWD ?? '', 'extraResources')
    : path.join(process.resourcesPath ?? '', 'extraResources'),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}

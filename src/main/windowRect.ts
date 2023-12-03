import { type BrowserWindow } from 'electron';
import os from 'os';
import path from 'path';

type InitWindowBounds = {
  width: number;
  height: number;
  x?: number;
  y?: number;
};
import packageJson from '../../package.json';

import JsonFile from './JsonFile';

const INIT_STATUS_PATH = path.join(
  os.tmpdir(),
  `${packageJson.name}`,
  'window_rect.json'
);

export const INI_WINDOW_WIDTH = 800;
export const INI_WINDOW_HEIGHT = 600;

export function loadWindowRect(): InitWindowBounds {
  const initStatusJson = JsonFile.read(INIT_STATUS_PATH);
  const windowBounds = initStatusJson?.bounds as InitWindowBounds;
  try {
    if (!windowBounds) {
      throw new Error('initWindowBounds is null');
    } else if (
      windowBounds.width < INI_WINDOW_WIDTH ||
      windowBounds.height < INI_WINDOW_HEIGHT
    ) {
      throw new Error('initWindowBounds is too small');
    } else {
      return windowBounds;
    }
  } catch {
    return {
      width: INI_WINDOW_WIDTH,
      height: INI_WINDOW_HEIGHT,
    };
  }
}

export function saveWindowRect(window: BrowserWindow): void {
  let initStatusJson;
  try {
    initStatusJson = { bounds: window.getBounds() };
  } catch {
    initStatusJson = null;
  }

  const areValidBounds =
    initStatusJson != null &&
    initStatusJson.bounds.width >= 0 &&
    initStatusJson.bounds.height >= 0 &&
    initStatusJson.bounds.x >= 0 &&
    initStatusJson.bounds.y >= 0;

  if (areValidBounds) {
    JsonFile.write(INIT_STATUS_PATH, initStatusJson);
  }
}

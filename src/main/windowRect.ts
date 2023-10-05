import { type BrowserWindow } from 'electron';
import fs from 'fs';
import os from 'os';
import { join } from 'path';

type InitWindowBounds = {
  width: number;
  height: number;
  x?: number;
  y?: number;
};
import packageJson from '../../package.json';

const INIT_STATUS_DIR = join(
  os.tmpdir(),
  `${packageJson.name}_${packageJson.version}`
);
const INIT_STATUS_FILE = 'window_rect.json';
const INIT_STATUS_PATH = join(INIT_STATUS_DIR, '/', INIT_STATUS_FILE);

export const INI_WINDOW_WIDTH = 800;
export const INI_WINDOW_HEIGHT = 600;

export function loadWindowRect(): InitWindowBounds {
  fs.mkdirSync(INIT_STATUS_DIR, { recursive: true });
  const initStatus = fs.readFileSync(INIT_STATUS_PATH, {
    encoding: 'utf8',
    flag: 'a+',
  });

  try {
    const initStatusJson = JSON.parse(initStatus);
    const windowBounds = initStatusJson?.bounds;

    if (!windowBounds) {
      throw new Error('initWindowBounds is null');
    } else if (
      windowBounds.width < INI_WINDOW_WIDTH ||
      windowBounds.height < INI_WINDOW_HEIGHT
    ) {
      throw new Error('initWindowBounds is too small');
    } else {
      return {
        width: windowBounds.width,
        height: windowBounds.height,
        x: windowBounds.x,
        y: windowBounds.y,
      };
    }
  } catch {
    return {
      width: INI_WINDOW_WIDTH,
      height: INI_WINDOW_HEIGHT,
    };
  }
}

export function saveWindowRect(window: BrowserWindow): void {
  const initStatusJson = { bounds: window.getBounds() };
  fs.writeFileSync(INIT_STATUS_PATH, JSON.stringify(initStatusJson));
}

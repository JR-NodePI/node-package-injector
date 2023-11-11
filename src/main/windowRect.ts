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

const INIT_STATUS_DIR = join(os.tmpdir(), `${packageJson.name}`);
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
    fs.writeFileSync(INIT_STATUS_PATH, JSON.stringify(initStatusJson));
  }
}

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

const INIT_STATUS_PATH = join(os.tmpdir(), '../window_rect.json');

export const INI_WINDOW_WIDTH = 800;
export const INI_WINDOW_HEIGHT = 600;

export function loadWindowRect(): InitWindowBounds {
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

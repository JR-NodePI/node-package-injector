import { type BrowserWindow } from 'electron';
import fs from 'fs';
import { join } from 'path';

type InitWindowBounds = Pick<Electron.Rectangle, 'width' | 'height'>;

const INIT_STATUS_PATH = join(__dirname, '../window_rect.json');

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

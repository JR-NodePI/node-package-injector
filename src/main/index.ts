import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import fs from 'fs';
import { join } from 'path';

import icon from '../../build/icons/png/1024x1024.png?asset';
import { createAppMenu, getMenuItemsTemplate } from './menu';

const INIT_STATUS_PATH = join(__dirname, '../init_status.json');

const INI_WINDOW_WIDTH = 800;
const INI_WINDOW_HEIGHT = 600;

function createWindow(): void {
  const initStatus = fs.readFileSync(INIT_STATUS_PATH, {
    encoding: 'utf8',
    flag: 'a+',
  });
  let initWindowBounds: Pick<Electron.Rectangle, 'width' | 'height'>;

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
      initWindowBounds = {
        width: windowBounds.width,
        height: windowBounds.height,
      };
    }
  } catch {
    initWindowBounds = {
      width: INI_WINDOW_WIDTH,
      height: INI_WINDOW_HEIGHT,
    };
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    ...initWindowBounds,
    minWidth: INI_WINDOW_WIDTH,
    minHeight: INI_WINDOW_HEIGHT,
    titleBarStyle: process.platform === 'linux' ? 'default' : 'hidden',
    titleBarOverlay: {
      color: '#5858f0',
      symbolColor: '#e6fffc',
      height: 35,
    },
    frame: false,
    autoHideMenuBar: process.platform === 'darwin',
    trafficLightPosition: { x: 10, y: 10 },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: false,
      sandbox: false,
      devTools: is.dev,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', function () {
    const lastStatus = { bounds: mainWindow.getBounds() };
    fs.writeFileSync(INIT_STATUS_PATH, JSON.stringify(lastStatus), 'utf8');
  });

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('github.com/JorgeRojo/fratch-ui');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createAppMenu();
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('quit', () => {
  app.quit();
});

ipcMain.on('show-context-menu', event => {
  const menu = Menu.buildFromTemplate(
    getMenuItemsTemplate([
      {
        label: 'Reset',
        click: (): void => {
          event.sender.send('reset');
        },
      },
    ])
  );
  const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
  menu.popup({ window });
});

ipcMain.on('reload', event => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
  window?.reload();
});

ipcMain.on('openDevTools', event => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
  window?.webContents.openDevTools();
});

ipcMain.on('closeDevTools', event => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
  window?.webContents.closeDevTools();
});

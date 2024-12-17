import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { fork } from 'child_process';
import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import Config from 'electron-config';
import path from 'path';

const config = new Config();

import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';

import { extraResourcesPath } from '../preload/constants';
import { createAppMenu, getMenuItemsTemplate } from './menu';

function createWindow(): void {
  const windowBounds: Record<string, number> = config.get('winBounds');

  const isUnsecurePositioning = Object.values(windowBounds).some(
    value => value < 0
  );

  const secureWindowBounds = isUnsecurePositioning ? {} : windowBounds;

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    ...secureWindowBounds,
    titleBarStyle: process.platform === 'linux' ? 'default' : 'hidden',
    titleBarOverlay: {
      color: '#5858f0',
      symbolColor: '#e6fffc',
      height: 30,
    },
    frame: process.platform === 'linux',
    autoHideMenuBar: process.platform === 'darwin',
    trafficLightPosition: { x: 10, y: 6 },
    icon: path.join(__dirname, '../renderer/icons/png/512x512.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: false,
      sandbox: false,
    },
    show: false,
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  let isReadyToClose = false;
  mainWindow.on('close', event => {
    if (isReadyToClose === false) {
      event.preventDefault();
      mainWindow.webContents.send('before-close');
    }

    config.set('winBounds', mainWindow.getBounds());
  });

  ipcMain.on('reset-kill-all-quit', (_event, data) => {
    fork(
      path.join(
        extraResourcesPath,
        'nodeScripts',
        'node_pi_reset_kill_all_defer.js'
      ),
      [
        data.NODE_PI_RESET_KILL_ALL_BASH_FILE,
        data.NODE_PI_FILE_PREFIX,
        data.TARGET_PACKAGE_CWD,
        ...((data.DEPENDENCIES_CWD_S as string[]) ?? []).map(depCwd => depCwd),
      ],
      { detached: true }
    );

    isReadyToClose = true;
    app.quit();
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
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  if (is.dev) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    await installExtension(REACT_DEVELOPER_TOOLS);
  }
  // Set app user model id for windows
  electronApp.setAppUserModelId('github.com/JorgeRojo/node-package-injector');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  createAppMenu();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
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

ipcMain.on('open-dev-tools', event => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
  window?.webContents.openDevTools({
    mode: 'bottom',
    activate: true,
  });
});

ipcMain.on('close-dev-tools', event => {
  const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
  window?.webContents.closeDevTools();
});

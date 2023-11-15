import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import { join } from 'path';

import TerminalService from '../preload/Terminal/TerminalService';
import { createAppMenu, getMenuItemsTemplate } from './menu';
import {
  INI_WINDOW_HEIGHT,
  INI_WINDOW_WIDTH,
  loadWindowRect,
  saveWindowRect,
} from './windowRect';

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    ...loadWindowRect(),
    minWidth: INI_WINDOW_WIDTH,
    minHeight: INI_WINDOW_HEIGHT,
    titleBarStyle: process.platform === 'linux' ? 'default' : 'hidden',
    titleBarOverlay: {
      color: '#5858f0',
      symbolColor: '#e6fffc',
      height: 30,
    },
    frame: process.platform === 'linux',
    autoHideMenuBar: process.platform === 'darwin',
    trafficLightPosition: { x: 10, y: 6 },
    icon: join(__dirname, '../renderer/icons/png/512x512.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: false,
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('move', () => {
    saveWindowRect(mainWindow);
  });
  mainWindow.on('resize', () => {
    saveWindowRect(mainWindow);
  });

  let isReadyToClose = false;
  mainWindow.on('close', event => {
    saveWindowRect(mainWindow);
    if (isReadyToClose === false) {
      event.preventDefault();
      mainWindow.webContents.send('before-close');
    }
  });

  ipcMain.on('reset-all-before-close', async (_event, data) => {
    await TerminalService.executeCommand({
      command: 'bash',
      args: [
        data.resetAllCommand,
        `"${data.NODE_PI_FILE_PREFIX}"`,
        `"${data.targetPackageCwd}"`,
        ...data.dependenciesCWDs.map(cwd => `"${cwd}"`),
      ],
      cwd: data.cwd,
      syncMode: true,
      addIcons: false,
      skipWSL: true,
    });

    if (!isReadyToClose) {
      isReadyToClose = true;
      app.quit();
    }
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

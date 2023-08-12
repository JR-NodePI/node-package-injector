import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import * as path from 'path';

const createWindow = (): void => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env?.DEV_PORT != null) {
    win.loadURL(`http://localhost:${process.env.DEV_PORT}/`);
  } else {
    win.loadFile(path.resolve(__dirname, './app/index.html'));
  }
};

function createAppMenu(): void {
  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: 'NodePI',
      submenu: [
        {
          role: 'reload',
          label: 'Reload',
        },
        {
          role: 'toggleDevTools',
          label: 'DevTools',
        },
        {
          role: 'quit',
          label: 'Quit Node Package Injector',
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createAppMenu();
});

import { Menu, MenuItemConstructorOptions } from 'electron';

export function createAppMenu(): void {
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

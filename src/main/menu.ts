import { Menu, MenuItemConstructorOptions } from 'electron';

export const getMenuItemsTemplate = (
  additionalItems: MenuItemConstructorOptions[] = []
): MenuItemConstructorOptions[] => [
  ...additionalItems,
  {
    role: 'reload',
    label: 'Reload',
  },
  {
    role: 'quit',
    label: 'Quit',
  },
  { type: 'separator' },
  {
    role: 'toggleDevTools',
    label: 'DevTools',
  },
];

export function createAppMenu(): void {
  const menuTemplate: MenuItemConstructorOptions[] =
    process.platform === 'linux'
      ? []
      : [
          {
            label: 'NodePI',
            submenu: getMenuItemsTemplate(),
          },
        ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

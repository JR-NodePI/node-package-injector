import packageJson from './package.json';

import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';

const APP_TITLE = 'Node Package Injector';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    define: {
      'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
      'import.meta.env.APP_TITLE': JSON.stringify(APP_TITLE),
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '/@fratch-ui-fonts': resolve('node_modules/fratch-ui/@fratch-ui-fonts'),
      },
    },
    plugins: [react()],
  },
});

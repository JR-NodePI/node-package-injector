// package.json
var package_default = {
  name: 'node-package-injector',
  version: '1.9.0',
  description: 'Dev tool to simulate npm dependencies',
  repository: 'https://github.com/JorgeRojo/node-package-injector',
  main: './out/main/index.js',
  author: 'JorgeRojo<jorge.rojodiseno@gmail.com>',
  scripts: {
    format: 'prettier --write .',
    lint: 'eslint . --ext .js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix',
    'typecheck:node': 'tsc --noEmit -p tsconfig.node.json --composite false',
    'typecheck:web': 'tsc --noEmit -p tsconfig.web.json --composite false',
    typecheck: 'yarn typecheck:node && yarn typecheck:web',
    start: 'electron-vite preview',
    dev: 'electron-vite dev',
    build: 'yarn typecheck && electron-vite build',
    postinstall: 'electron-builder install-app-deps',
    'build:win': 'yarn build && electron-builder --win --config',
    'build:mac': 'electron-vite build && electron-builder --mac --config',
    'build:linux': 'electron-vite build && electron-builder --linux --config',
    icons:
      'electron-icon-builder --input=./src/renderer/src/assets/logo-1024x1024.png --output=./build/public',
    test: 'vitest --run --config ./vitest.config.ts',
    'test:cover': 'yarn test run --coverage',
  },
  dependencies: {
    '@electron-toolkit/preload': '2.0.0',
    '@electron-toolkit/utils': '2.0.1',
    'electron-updater': '6.1.4',
    'fratch-ui': '1.8.4',
    lodash: '4.17.21',
    react: '18.2.0',
    'react-dom': '18.2.0',
    'use-deep-compare-effect': '1.8.1',
  },
  devDependencies: {
    '@electron-toolkit/tsconfig': '1.0.1',
    '@electron/notarize': '2.2.0',
    '@testing-library/jest-dom': '^5.17.0',
    '@testing-library/react': '^14.0.0',
    '@testing-library/user-event': '^14.4.3',
    '@types/node': '^18.16.19',
    '@types/react': '^18.2.14',
    '@types/react-dom': '^18.2.6',
    '@typescript-eslint/eslint-plugin': '^5.62.0',
    '@typescript-eslint/parser': '^5.62.0',
    '@vitejs/plugin-react': '^4.0.3',
    '@vitest/coverage-v8': '^0.34.5',
    electron: '27.1.0',
    'electron-builder': '24.6.4',
    'electron-icon-builder': '2.0.1',
    'electron-vite': '1.0.28',
    eslint: '^8.44.0',
    'eslint-config-prettier': '^8.8.0',
    'eslint-plugin-prettier': '^4.2.1',
    'eslint-plugin-react': '^7.32.2',
    'eslint-plugin-react-hooks': '^4.6.0',
    'eslint-plugin-react-refresh': '^0.4.3',
    'eslint-plugin-simple-import-sort': '^10.0.0',
    'istanbul-lib-coverage': '^3.2.0',
    jsdom: '^22.1.0',
    million: '^2.5.10',
    prettier: '^2.8.8',
    'rollup-plugin-node-builtins': '^2.1.2',
    typescript: '5.1.6',
    vite: '^4.4.2',
    'vite-plugin-dts': '^3.3.1',
    vitest: '^0.33.0',
  },
};

// electron.vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';
var APP_TITLE = 'NODE PACKAGE INJECTOR';
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    define: {
      'import.meta.env.PACKAGE_VERSION': JSON.stringify(
        package_default.version
      ),
      'import.meta.env.APP_TITLE': JSON.stringify(APP_TITLE),
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
      },
    },
    plugins: [react()],
    publicDir: resolve('build/public'),
  },
});
export { electron_vite_config_default as default };

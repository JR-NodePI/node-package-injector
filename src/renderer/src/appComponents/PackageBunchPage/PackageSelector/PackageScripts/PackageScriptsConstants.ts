import { PackageScript } from '@renderer/models/PackageScript';

export const ADDITIONAL_PACKAGE_SCRIPTS_NAMES = {
  NPM_INSTALL: '🔗 npm install',
  YARN_INSTALL: '🔗 yarn install',
  PNPM_INSTALL: '🔗 pnpm install',
};

export const ADDITIONAL_PACKAGE_SCRIPTS: Record<string, PackageScript> = {
  [ADDITIONAL_PACKAGE_SCRIPTS_NAMES.NPM_INSTALL]: {
    scriptName: ADDITIONAL_PACKAGE_SCRIPTS_NAMES.NPM_INSTALL,
    scriptValue: 'npm install --pure-lockfile',
  },
  [ADDITIONAL_PACKAGE_SCRIPTS_NAMES.YARN_INSTALL]: {
    scriptName: ADDITIONAL_PACKAGE_SCRIPTS_NAMES.YARN_INSTALL,
    scriptValue: 'yarn install --pure-lock',
  },
  [ADDITIONAL_PACKAGE_SCRIPTS_NAMES.PNPM_INSTALL]: {
    scriptName: ADDITIONAL_PACKAGE_SCRIPTS_NAMES.PNPM_INSTALL,
    scriptValue: 'pnpm install --frozen-lockfile',
  },
} as const;

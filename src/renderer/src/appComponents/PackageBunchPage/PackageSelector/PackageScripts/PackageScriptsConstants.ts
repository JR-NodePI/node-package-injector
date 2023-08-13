import PackageScript from '@renderer/models/PackageScript';

export const ADDITIONAL_PACKAGE_SCRIPTS_NAMES = {
  NPM_INSTALL: '🔗 npm install',
  YARN_INSTALL: '🔗 yarn install',
  PNPM_INSTALL: '🔗 pnpm install',
};

export const ADDITIONAL_PACKAGE_SCRIPTS: Record<string, PackageScript> = {
  [ADDITIONAL_PACKAGE_SCRIPTS_NAMES.NPM_INSTALL]: new PackageScript(
    ADDITIONAL_PACKAGE_SCRIPTS_NAMES.NPM_INSTALL,
    'npm install --pure-lockfile'
  ),
  [ADDITIONAL_PACKAGE_SCRIPTS_NAMES.YARN_INSTALL]: new PackageScript(
    ADDITIONAL_PACKAGE_SCRIPTS_NAMES.YARN_INSTALL,
    'yarn install --pure-lock'
  ),
  [ADDITIONAL_PACKAGE_SCRIPTS_NAMES.PNPM_INSTALL]: new PackageScript(
    ADDITIONAL_PACKAGE_SCRIPTS_NAMES.PNPM_INSTALL,
    'pnpm install --frozen-lockfile'
  ),
} as const;

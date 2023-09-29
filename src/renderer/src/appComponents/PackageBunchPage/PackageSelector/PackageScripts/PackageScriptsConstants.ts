import PackageScript from '@renderer/models/PackageScript';

export const ADDITIONAL_PACKAGE_SCRIPTS_NAMES = {
  NPM_INSTALL: '🔗 npm install',
  YARN_INSTALL: '🔗 yarn install',
  PNPM_INSTALL: '🔗 pnpm install',
  REMOVE_NODE_MODULES: '🔗 remove node_modules',
  OPEN_CURRENT_DIR_IN_I_TERM: '🔗 open in iTerm',
  OPEN_CURRENT_DIR_IN_GENOME_TERMINAL: '🔗 open in genome terminal',
} as const;

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
  [ADDITIONAL_PACKAGE_SCRIPTS_NAMES.REMOVE_NODE_MODULES]: new PackageScript(
    ADDITIONAL_PACKAGE_SCRIPTS_NAMES.REMOVE_NODE_MODULES,
    'rm -r ./node_modules &>/dev/null'
  ),
  [ADDITIONAL_PACKAGE_SCRIPTS_NAMES.OPEN_CURRENT_DIR_IN_I_TERM]:
    new PackageScript(
      ADDITIONAL_PACKAGE_SCRIPTS_NAMES.OPEN_CURRENT_DIR_IN_I_TERM,
      'open -a iTerm .'
    ),
  [ADDITIONAL_PACKAGE_SCRIPTS_NAMES.OPEN_CURRENT_DIR_IN_GENOME_TERMINAL]:
    new PackageScript(
      ADDITIONAL_PACKAGE_SCRIPTS_NAMES.OPEN_CURRENT_DIR_IN_GENOME_TERMINAL,
      'gnome-terminal --working-directory=./'
    ),
} as const;

export const ADDITIONAL_COMMON_PACKAGE_SCRIPTS = [
  ADDITIONAL_PACKAGE_SCRIPTS[
    ADDITIONAL_PACKAGE_SCRIPTS_NAMES.REMOVE_NODE_MODULES
  ],
] as const;

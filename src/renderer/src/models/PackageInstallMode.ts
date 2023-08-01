export const PackageInstallMode = {
  NPM: 'npm',
  YARN: 'yarn',
} as const;

export type PackageInstallModeValue =
  (typeof PackageInstallMode)[keyof typeof PackageInstallMode];

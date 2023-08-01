import { useEffect, useState } from 'react';

import {
  PackageInstallMode,
  type PackageInstallModeValue,
} from '@renderer/models/PackageInstallMode';
import NPMService from '@renderer/services/NPMService';
import { Form } from 'fratch-ui';

import { PackageSelectorProps } from './PackageSelectorProps';

export default function PackageInstallCheck({
  disabled,
  packageConfig,
  onPackageInstallChange,
}: Pick<
  PackageSelectorProps,
  'disabled' | 'packageConfig' | 'onPackageInstallChange'
>): JSX.Element {
  const [installMode, setInstallMode] = useState<PackageInstallModeValue>();

  useEffect(() => {
    (async (): Promise<void> => {
      if (packageConfig?.cwd != null) {
        const isNPM = await NPMService.checkNPM(packageConfig.cwd);
        const isYarn =
          !isNPM && (await NPMService.checkYarn(packageConfig.cwd));

        setInstallMode(
          isNPM
            ? PackageInstallMode.NPM
            : isYarn
            ? PackageInstallMode.YARN
            : undefined
        );
      }
    })();
  }, [packageConfig?.cwd]);

  if (installMode == null) {
    return <></>;
  }

  const label = `${
    installMode === PackageInstallMode.NPM ? 'npm' : 'yarn'
  } install`;

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onPackageInstallChange?.(event.target.checked ? installMode : undefined);
  };

  return (
    <Form.InputCheck
      disabled={disabled}
      checked={packageConfig?.performInstallMode != null}
      label={label}
      onChange={handleOnChange}
    />
  );
}
